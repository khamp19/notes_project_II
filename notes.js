const mongoose = require('mongoose');

const NotesSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Note'
  },
  content: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', NotesSchema);
