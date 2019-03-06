const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const isLoggedIn = require('./config/token')
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const debug = require('debug')('SERVER:');
const User = require('./models/user');
const app = express();
const server = require('http').Server(app)
const p2pserver = require('socket.io-p2p-server').Server
const io = require('socket.io')(server);
const api = require('./routes/api');
const user = require('./routes/user');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const csrfMiddleware = csurf({
  cookie: true
});
var conditionalCSRF =  (req, res, next) => {
  debug(req.originalUrl);
  if (req.originalUrl !== '/api/call' && req.originalUrl !== '/api/secret' && req.originalUrl !== '/api/exchange') {
    csrfMiddleware(req, res, next);
  } else {
    next();
  }
}

io.use(p2pserver);
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true}).then(()=>{
  debug(process.env.DATABASE);
}).catch((err)=>{
  debug(err);
});

app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(conditionalCSRF);

let getCookie = (cookie,name) => {
  let value = "; " + cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
  return undefined;
}

io.on('connection', client => {
  client.on('msg',(msg)=>{
    console.log(msg);
  })
  client.on('test',(dat)=>{
    console.log(dat);
  })
  client.on('audioToPeer',(stream)=>{
    console.log(stream);
  })
  let token = getCookie(client.request.headers.cookie,'token');
  if(!token) {
    debug("anonymous user id = ",client.id);
  } else {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        debug("bad request user id = ",client.id);
      } else {
        User.updateOne({_id: decoded._id},{$set: {isOnline:true,socketId:client.id}}).then(() => {
          debug("user is online with id = ",client.id);
        }).catch((err) => {
          debug(err);
        })
      }
    });
  }
  client.on('disconnect', () => {
    let token = getCookie(client.request.headers.cookie,'token');
    debug(token)
    if(!token) {
      debug("anonymous user id disconnected = ",client.id);
    } else {
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          debug("bad request user id = ",client.id);
        } else {
          User.updateOne({_id: decoded._id},{$set: {isOnline:false}}).then(() => {
            debug("user is offline with id = ",client.id);
          }).catch((err) => {
            debug(err);
          })
        }
      });
    }
  });
});

app.post('/api/call',isLoggedIn,(req,res) => { // check if both are friends pending
  User.findById(req.body.id).select({name:1,profilePic:1,socketId:1}).then((to) => {
    if(to) {
      User.findById(res.locals.id).select({name:1,profilePic:1,socketId:1}).then((from) => {
        if(from) {
          let object = {
            from : from,
            pubKey: req.body.key,
            room: req.body.roomValue,
            isVideo: req.body.isVideo
          }
          io.to(to.socketId).emit('calling',object);
          return res.status(200).json({'calling':'...'});
        } else {
          return res.status(400).json({'danger':'Something Went Wrong'});
        }
      })
    } else {
      return res.status(400).json({'danger':'Something Went Wrong'});
    }
  }).catch((err) => {
    debug(err);
    return res.status(400).json({'danger':'Something Went Wrong'});
  })
})

app.post('/api/secret',isLoggedIn,(req,res) => { // check if both are friends pending
  User.findById(req.body.id).select({name:1,profilePic:1,socketId:1}).then((to) => {
    if(to) {
      console.log(to);
      io.to(to.socketId).emit('getCypher',{cypher:req.body.cypher,id:res.locals.id,key:req.body.key,room:req.body.room});
      return res.status(200).json({'cypher':'...'});
    } else {
      return res.status(400).json({'danger':'Something Went Wrong'});
    }
  }).catch((err) => {
    debug(err);
    return res.status(400).json({'danger':'Something Went Wrong'});
  })
})
app.post('/api/exchange',isLoggedIn,(req,res) => {
  console.log(req.body.id);
  User.findById(req.body.id).select({name:1,profilePic:1,socketId:1}).then((to) => {
    if(to) {
      io.to(to.socketId).emit('cypherShare',{cypher: req.body.cypher,room:req.body.room});
      return res.status(200).json({'cypherShare':'...'});
    } else {
      return res.status(400).json({'danger':'Something Went Wrong'});
    }
  }).catch((err) => {
    debug(err);
    return res.status(400).json({'danger':'Something Went Wrong'});
  })
})

app.get('/api/endcall',isLoggedIn,(req,res) => { // check if both are friends pending
  User.findById(req.query.id).select({name:1,socketId:1}).then((user) => {
    if(user) {
      io.to(user.socketId).emit('end','disconnect');
      return res.status(200).json({'end call':'...'});
    } else {
      return res.status(400).json({'danger':'Something Went Wrong'});
    }
  }).catch((err) => {
    debug(err);
    return res.status(400).json({'danger':'Something Went Wrong'});
  })
})

app.use('/api/user',user);
app.use('/api',api);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({err:'error'});
});


server.listen(process.env.PORT,() => {
  debug("listening at PORT = "+process.env.PORT);
});
