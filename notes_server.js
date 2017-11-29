const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Note = require('./notes');
const path = require('path');

const PORT = normalizePort(process.env.PORT || 8080);

mongoose.Promise = global.Promise;
const connect = mongoose.connect(
  'mongodb://localhost/notes',
  { useMongoClient: true }
); //replace this link with one from mLabs

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;

const app = express();
const dev = app.get('env') !== 'production';
if(!dev) {
  app.disable('x-powered-by');
  app.use(express.static(path.resolve(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'))
  })
}
app.use(cors());
app.use(bodyParser.json());

// handle errors
app.use((req, res, next) => {
  res.sendUserError = function (err) {
    const userError = typeof err ==='string' ? { error: err } : err;
    this.status(STATUS_USER_ERROR);
    this.json(userError);
  };
  next();
});

app.use((req, res, next) => {
  res.sendSystemError = function (err) {
    const systemError = err;
    this.status(STATUS_SERVER_ERROR);
    this.json(systemError);
    return;
  };
  next();
});

app.listen(8080, () => {
  console.log('Server listening');
});

// handle welcome/ home page
// this will be the login/ create page
app.get('/', (req, res) => {
  res.json('hello world!');
});

// create new note
app.post('/notes', (req, res) => {
  const { title, content, created_at } = req.body;
  if (!content) {
    res.sendUserError('Please add content to your note');
    return;
  }
  const newNote = new Note(req.body);
  newNote.save((err, newNote) => {
    if(err) res.sendSystemError('Could not save note');
    res.status(200).json(newNote);
  });
});

// retrieve all notes
app.get('/notes', (req, res) => {
  Note.find({}, (err, notes) => {
    if(err) res.sendSystemError('Cannot get notes');
    res.json(notes);
  });
});

// retrieve a note
app.get('/notes/:id', (req, res) => {
  const id = req.params.id;
  Note.findById(req.params.id, (err, note) => {
    if(err) res.sendSystemError(err);
    if(!id) {
      res.sendUserError('Note not found');
      return;
    }
    res.json(note);
  });
});

// update note- find, edit, save
app.put('/notes/:id', (req, res) => {
  const id = req.params.id;
  Note.findById(req.params.id, (err, note) => {
    if(err) res.sendSystemError(err);
    if(!id) {
      res.sendUserError('Note not found');
      return;
    }
    // edit the note
    note.title = req.body.title;
    note.content = req.body.content;
    // save the note
    note.save((err, note) => {
      if(err) res.sendSystemError(err);
      res.json(note);
    });
  });
});

//delete note- find and delete
app.delete('/notes/:id', (req, res) => {
  const id = req.params.id;
  Note.findByIdAndRemove(req.params.id, (err, note) => {
    if(err) return res.sendSystemError(err);
    if(!id) {
      res.sendUserError('Note not found');
      return;
    }
    res.json({ success: true, message: 'note successfully deleted'});
  });
});
