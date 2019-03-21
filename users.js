const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// const NotesSchema = require('./notes');

const UserSchema = new mongoose.Schema({
  //username, password, notes
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userNotes: []
});

//hash pws
UserSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 11, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    return next();
  })
})

UserSchema.methods.comparePass = function (password) {
  return bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);

//notes:[NotesSchema]- this should work but doesnt?