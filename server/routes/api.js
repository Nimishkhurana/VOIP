const debug = require('debug')('api:');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Request = require('../models/request');
const isLoggedIn = require('../config/token');
const crypto = require('crypto');
router.get('/',(req,res) => {
  return res.send("express is running");
})

router.get('/api/',(req,res) => {
  var diffHell = crypto.createDiffieHellman(512);
  diffHell.generateKeys('base64');
  console.log("Public Key : " ,diffHell.getPublicKey('base64'));
  console.log("Private Key : " ,diffHell.getPrivateKey('base64'));
  return res.json({})
})

router.get('/isonline',isLoggedIn,(req,res)=>{
  User.findById(res.locals.id).populate('friends',{name:1,profilePic:1,isOnline:1}).select({friends:1}).then((result) => {
    return res.json({user:result});
  }).catch((err) => {
    debug(err);
    return res.json({user:'Something went wrong'});
  })
})

router.get('/viewprofile',isLoggedIn,(req,res) => {
  if(req.query.id.length >= 24) {
    User.findById(res.locals.id).then((user) => {
      let ans = user.friends.indexOf(mongoose.Types.ObjectId(req.query.id));
      User.findById(req.query.id).select({profilePic:1,name:1,email:1}).then((u2) => {
        if(u2) {
          Request.find({$or:[{from: res.locals.id,to:u2._id},{from: u2._id,to:res.locals.id}]})
            .then((request)=>{
              if(request.length > 0) {
                return res.status(200).json({user:u2,isFriend:(ans>-1?true:false),canSendReq:false});
              } else {
                return res.status(200).json({user:u2,isFriend:(ans>-1?true:false),canSendReq:true});
              }
            }).catch((err) => {
              debug(err);
              return res.status(400).json({'danger':'Something Went Wrong'});
            })

        } else {
          return res.status(400).json({'danger':'Something Went Wrong'});
        }
      }).catch((err) => {
        debug(err);
        return res.status(400).json({'danger':'Something Went Wrong'});
      })
    }).catch((err) => {
      debug(err);
      return res.status(400).json({'danger':'Something Went Wrong'});
    });
  } else {
    debug(req.query.id);
    return res.status(400).json({'danger':'Something Went Wrong'});
  }
});

router.get('/search',isLoggedIn,(req,res)=>{
  if(req.query.name.length >= 3) {
    User.find({ _id: {$ne: res.locals.id} ,name:{ $regex: req.query.name, $options: 'i' }})
        .select({name:1,profilePic:1,email:1}).then((results) => {
          debug(results)
          if(results.length > 0) {
            return res.status(200).json({'users':results});
          } else {
            return res.status(400).json({'warning':'no result'});
          }
        }).catch((err) => {
          debug(err);
          return res.status(400).json({'danger':'something went wrong'});
        })
  } else {
    return res.status(400).json({'warning':'no result'});
  }
})


router.get('/notification',isLoggedIn, (req,res)=>{
  Request.find({to:res.locals.id}).populate('from',{name:1,profilePic:1,email:1}).then((result) => {
    debug(result);
    return res.status(200).json({'user':result});
  }).catch((err) => {
    debug(err)
    return res.status(400).json({'danger':'Something Went Wrong'});
  });
})

router.get('/accept',isLoggedIn,(req,res) => {
  Request.findById(req.query.id).then((result) => {
    if(result.to != res.locals.id){
      return res.status(400).json({'danger':'Unauthorized Request'});
    } else {
      User.find({
      '_id': { $in: [
          mongoose.Types.ObjectId(result.to),
          mongoose.Types.ObjectId(result.from)
      ]}}).then((users) => {
        users[0].friends.push(users[1]._id);
        users[1].friends.push(users[0]._id);
        debug(users[0]);
        User.update({_id:users[0]._id},users[0]).then(() => {
          User.update({_id:users[1]._id},users[1]).then(() => {
            Request.deleteOne({_id:req.query.id}).then(() => {
              return res.status(200).json({'success':'You are friends Now'});
            }).catch((err) =>{
              debug(err);
              return res.status(400).json({'danger':'Something Went Wrong'});
            });
          }).catch((err) => {
            debug(err);
            return res.status(400).json({'danger':'Something Went Wrong'});
          })
        }).catch((err) => {
          debug(err);
          return res.status(400).json({'danger':'Something Went Wrong'});
        })
      }).catch((err) => {
        debug(err);
        return res.status(400).json({'danger':'Something Went Wrong'});
      })
    }
  }).catch((err) => {
      debug(err);
      return res.status(400).json({'danger':'Something Went Wrong'});
    })
})

router.get('/sendRequest',isLoggedIn,(req,res) => {
  if(res.locals.id === req.query.id) {
    return res.status(400).json({'danger':'Something Went Wrong'});
  } else {
    User.findById(res.locals.id).then((result) => {
      if(req.query.id in result.friends) {
        debug("already friends");
        return res.status(400).json({'danger':'You are Already Friends'});
      } else {
        User.findById(req.query.id).then((result) => {
          if(result) {
            let request = new Request({
              from: res.locals.id,
              to: req.query.id
            });
            request.save().then(() => {
              return res.status(200).json({'success':'Request send to'+result.name});
            }).catch((err) => {
              debug(err);
              return res.status(400).json({'danger':'Something Went Wrong'});
            });
          } else {
            return res.status(400).json({'danger':'No user Found'});
          }
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
})



module.exports = router;
