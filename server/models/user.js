const mongoose = require('mongoose')
const bcrypt = require("bcrypt-nodejs")
const debug = require('debug')('userSchema:');
const userSchema = new mongoose.Schema({
  email: {type:String,required:true,unique:true},
  name: {type:String,required:true,unique:true},
  password:{type:String,required:true},
  isVerified: {
    type:Boolean,
    default:true
  },
  profilePic:{
    type:String,
    default: "/defaultPic.png"
  },
  isOnline: {
    type:Boolean,
    default: false
  },
  socketId : {
    type: String,
    default: null
  },
  friends : [{ type: mongoose.Schema.Types.ObjectId,
         ref: "User" }]
})
userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password,bcrypt.genSaltSync(10),null)
}

userSchema.methods.validPassword = (password, userPassword) => {
  return bcrypt.compareSync(password,userPassword);
}
module.exports = mongoose.model("User",userSchema);
