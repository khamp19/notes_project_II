const mongoose = require('mongoose');
const NotesSchema = require('./notes');

const UserSchema = new mongoose.Schema({
  //email, password, notes
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  notes: [NotesSchema],
});

module.exports = mongoose.model('User', UserSchema);
