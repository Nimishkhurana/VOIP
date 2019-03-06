const mongoose = require('mongoose')
const requestSchema = new mongoose.Schema({
  from : { type: mongoose.Schema.Types.ObjectId,
           ref: "User" },
  to : { type: mongoose.Schema.Types.ObjectId,
         ref: "User" },
  created_at: { type: Date, required: true, default: Date.now }
})
requestSchema.index({ from: 1, to: 1}, { unique: true });
module.exports = mongoose.model("Request",requestSchema);
