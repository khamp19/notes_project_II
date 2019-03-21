const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Note = require('./notes');
const path = require('path');
const { makeToken, verifyToken } = require('./AuthFns');
const User = require('./users');
const bcrypt = require('bcrypt');
require('dotenv').config();


const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useMongoClient: true });

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;

const app = express();
app.use(cors());
app.use(express.json());

// handle errors
app.use((req, res, next) => {
  res.sendUserError = function (err) {
    const userError = typeof err === 'string' ? { error: err } : err;
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

app.listen(PORT, () => {
  console.log('Server listening');
});

// handle welcome/ home page
// this can be deleted
app.get('/', (req, res) => {
  res.json('hello world!');
});

//----------------------------------------User Related Requests-------------------------------------------//
//create user- register
app.post('/user/register', (req, res) => {
  const newUser = new User(req.body);
  newUser.save((err, user) => {
    if (err) return res.sendSystemError('could not save user');
    const token = makeToken(user);
    const username = user.username;
    return res.status(200).json({ username, token });
  })
})

//log user in
app.put('/user/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username })
    .then(user => {
      user.comparePass(password)
        .then(isMatch => {
          if (isMatch) {
            const token = makeToken(user);
            res.status(200).json({ username, token })
          } else {
            res.status(401).json({ msg: 'login failed' })
          }
        })
        .catch(err => res.status(401).json({ msg: 'passwords do not match' }))
    })
    .catch(err => res.status(401).json({ msg: 'user not found' }));
})

//user dashboard- see '/self' notes
//should return the notes of this user
app.get('/user/dashboard', verifyToken, (req, res) => {
  const { jwtPayload } = req;
  User.findById(jwtPayload.sub)
    .then(user => {
      //should return the notes of this user
      // const username = user.username;
      // const userNotes = user.notes;
      const { username, userNotes } = user;
      res.status(200).json({ username, userNotes })
    })
    .catch(err => res.sendSystemError('cannot get user'))
})

//delete user
app.delete('/user/delete-account', verifyToken, (req, res) => {
  const { jwtPayload } = req;
  User.findByIdAndRemove(jwtPayload.sub)
    .then(user => {
      const { username } = user;
      res.status(200, 'user successfully removed').json(username);
    })
    .catch(err => res.sendSystemError('cannot remove user'));
})

//----------------------------------------Notes Related Requests-------------------------------------------//
// create new note- req authentication
// add username to post 
app.post('/notes', verifyToken, (req, res) => {
  const { title, content, created_at, username } = req.body;
  if (!title) {
    res.sendUserError('Note must have a title');
    return;
  }
  if (!content) {
    res.sendUserError('Please add content to your note');
    return;
  }
  const newNote = new Note(req.body);
  newNote.save((err, newNote) => {
    if (err) res.sendSystemError('Could not save note');
    res.status(200).json(newNote);
  });
});

// retrieve all notes
app.get('/notes', (req, res) => {
  Note.find({}, (err, notes) => {
    if (err) res.sendSystemError('Cannot get notes');
    res.json(notes);
  });
});

// retrieve a note
app.get('/notes/:id', (req, res) => {
  const id = req.params.id;
  Note.findById(req.params.id, (err, note) => {
    if (err) res.sendSystemError(err);
    if (!id) {
      res.sendUserError('Note not found');
      return;
    }
    res.json(note);
  });
});

// update note- find, edit, save
// req authentication
app.put('/notes/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  Note.findById(id, (err, note) => {
    if (err) res.sendSystemError(err);
    if (!id) {
      res.sendUserError('Note not found');
      return;
    }
    // edit the note
    note.title = req.body.title;
    note.content = req.body.content;
    // save the note
    note.save((err, note) => {
      if (err) res.sendSystemError(err);
      res.json(note);
    });
  });
});

//delete note- find and delete
//req authentication
//------------------TEST ME----------------//
app.delete('/notes/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  Note.findByIdAndRemove(id, (err, note) => {
    if (err) return res.sendSystemError(err);
    if (!id) {
      res.sendUserError('Note not found');
      return;
    }
    res.json({ success: true, message: 'note successfully deleted', note });
  });
});
