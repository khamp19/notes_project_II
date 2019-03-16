const mongoose = require('mongoose');

const NotesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'New Note'
  },
  content: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  postedBy: String
});

//set up date parsing with moment?

module.exports = mongoose.model('Note', NotesSchema);
