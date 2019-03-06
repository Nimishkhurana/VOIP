const debug = require('debug')('user:');
const express = require('express');
const router = express.Router();
const isLoggedIn = require('../config/token');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

let getCookie = (cookie,name) => {
  let value = "; " + cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
  return undefined;
}

router.get('/signin',(req,res) => {
  debug("yor:",req.csrfToken());
  return res.json({_token:req.csrfToken()});
})
router.post('/signin',(req,res) => {
  console.log(req.headers.cookie);
  if(req.body.email === '' || req.body.password === ''){
    return res.status(400).json({'danger':'Invalid Credentials'});
  }
  User.findOne({email:req.body.email}).then((result) => {
    if(result) {
      debug(result);
      if(result.validPassword(req.body.password, result.password)) {
        if(result.isVerified) {
          const payload = { _id: result._id };
          const token = jwt.sign(payload, process.env.SECRET, {
            expiresIn: '24h'
          });
          User.update({_id: result._id},{$set: {isOnline:true,socketId:getCookie(req.headers.cookie,'io')}}).then(() => {
            res.cookie('token', token, {expire : new Date() + 9999});
            return res.status(200).json({
              success:'Looging You In'
            });
          }).catch((err) => {
            debug(err);
            return res.status(400).json({'danger':'Account Not Verified'});
          })
        } else {
          return res.status(400).json({'danger':'Account Not Verified'});
        }
      } else {
        return res.status(400).json({'danger':'Incorrect Password'});
      }
    } else {
      return res.status(400).json({'danger':'No User Found'});
    }
  }).catch((err)=> {
    debug(err);
    return res.status(400).json({'danger':'Something Went Wrong'});
  })
})

router.get('/signup',(req,res) => {
  return res.json({_token:req.csrfToken()});
})

router.post('/signup',(req,res) => {
  if(req.body.name === '' || req.body.email === '' || req.body.password === ''){
    return res.status(400).json({'danger':'Invalid Credentials'});
  }
  User.find({name:req.body.name}).then((result) => {
    debug(result)
    if(result.length != 0) {
      return res.status(400).json({'danger':'UserName already taken'});
    } else {
      User.findOne({email:req.body.email}).then((result)=>{
        if(result) {
          return res.status(200).json({'warning':'Email Already In Use'});
        } else {
          let user = new User({
            email: req.body.email,
            name:req.body.name,
            friends: []
          });
          user.password = user.encryptPassword(req.body.password);
          user.save().then((result)=>{
            return res.status(200).json({'success':'Please Check Your Email!!'});
          }).catch((err)=>{
            debug(err);
            return res.status(400).json({'danger':'Something Went Wrong'});
          })
        }
      }).catch((err) => {
        debug(err);
        return res.status(400).json({'danger':'Something Went Wrong'});
      })
    }
  }).catch((err) => {
    debug(err);
    return res.status(400).json({'danger':'Something Went Wrong'});
  })
});

router.get('/user',isLoggedIn,(req,res)=>{
  User.findById(res.locals.id).populate('friends',{name:1,profilePic:1,isOnline:1}).then((result) => {
    return res.json({user:result});
  }).catch((err) => {
    debug(err);
    return res.json({user:'Something went wrong'});
  })
})

router.get('/logout',isLoggedIn,(req,res)=>{
  res.clearCookie('token');
  if(res.locals.id) {
    User.update({_id: res.locals.id},{$set: {isOnline:false}}).then(()=>{
      return res.status(200).json({'Success':'Loging You Out'});
    }).catch((err)=>{
      console.log(err);
      return res.status(400).json({'danger':'Something Went Wrong'});
    })
  } else {
    return res.status(400).json({'danger':'Something Went Wrong'});
  }
})

module.exports = router;
