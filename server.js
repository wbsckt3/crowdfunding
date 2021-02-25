const express = require('express');
const serveStatic = require("serve-static")
const path = require('path');
app = express();

app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/fauth.html');
 });
 
 app.get('/init-firebase.js', function (req, res) {
  res.sendFile(__dirname + '/init-firebase.js');
 });

app.use(serveStatic(path.join(__dirname, 'dist')));
const port = process.env.PORT || 80;
app.listen(port);
