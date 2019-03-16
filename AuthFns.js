const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.SECRET;

const makeToken = (user) => {
  const payload = {
    sub: user._id,
    name: user.username,
  }
  const options = {
    expiresIn: '24h',
  }
  return jwt.sign(payload, SECRET, options);
}

//remove console.log
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if(!token) {
    return res.status(401).json('user not logged in')
  } 
  jwt.verify(token, SECRET, (err, payload) => {
    // console.log(payload);
    if(err) return res.status(500).json({msg: 'cannot get payload'})
    req.jwtPayload = payload;
    next();
  })
}

module.exports = {makeToken, verifyToken };