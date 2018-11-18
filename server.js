const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// cors-- for allowing cross domain requests...
const cors = require("cors");
const socket = require('socket.io');
const loggerServices = require('./server/loggerServices/loggerServices');

// const auth = require('http-auth');
//
// let HTTPAuthentication = auth.basic({
//   realm: "Rahul Punase Football Geek",
// }, function (username, password, cb) {
//   cb(username === 'admin' && password === 'fg-allnotshare-to-everyone');
// });

const authentication = require("./server/routes/authentication");
const posts = require("./server/routes/posts");
const framework = require("./server/routes/framework/frm.news");
const events = require("./server/routes/framework/frm.events");
const general = require("./server/routes/general");
const profile = require("./server/routes/profile");
const newsapi = require("./server/routes/newsapi")
const page = require("./server/routes/page");
// validators should always be written under than express.Router to make it work.
// const expValidator = require('express-validator');
// const expSession = require('express-session');
const port = process.env.PORT || 3000;
let server = app.listen(port, (err) => {
  console.log("Running");
});
//api variables
let local_db = "mongodb://localhost:27017/football_geek";
let prod_db = "mongodb://rahulpunasefootballgeek:rahulpunasefootballgeekpassword1@ds121182.mlab.com:21182/football_geek";
mongoose.connect(prod_db, { useNewUrlParser: true }, (err)=>{
  if(err) {
    console.log(err);
  }else {
    console.log('connected to db');
  }
});



app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:5000", "http://localhost"]
  })
);

// parsing the body to get the values
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
  { extended: true, limit: '50mb', parameterLimit:50000}
  ));

// validator
// app.use(expValidator());

// static file
app.use(express.static(path.join(__dirname, "dist/football"))); //static file
app.use(express.static('public'));


// Session --
// saveUninitialized --  make sure our session is stored.
// re save -- if true: save our session after each request
// app.use(expSession({secret:'max', saveUninitialized: false, resave: false}));

// all request will go through post
// app.use(auth.connect(HTTPAuthentication));
app.use("/authentication", authentication);
app.use("/posts", posts);
app.use("/framework", framework);
app.use("/general", general);
app.use("/profile", profile);
app.use("/events", events);
app.use("/newsapi", newsapi);
app.use("/page", page);
// catch all route request
// app.get("/images", (req, res)=>{
//   res.header('Content-type', 'img/jpg');
//   res.send("haha");
// })
app.get("/fg-framework/news", (req, res) => {
  res.sendFile(path.join(__dirname, "framework/news.html"));
});
app.get("/fg-framework/events", (req, res) => {
  res.sendFile(path.join(__dirname, "framework/events.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/football/index.html"));
  //console.log("we are here");
});

// websockets start here


let io = socket(server);

io.on('connection', function(socket) {
  // console.log('new connection made');
  socket.on('join', (data) => {
    socket.join(data.token);
    // console.log('Room joined' + data.token);
    socket.broadcast.to(data.token).emit('room_joined', {
      room: data.token,
      message: 'joined'
    });
  });

  socket.on('leave', (data) => {

  });

  socket.on('typing', (data) => {
    socket.broadcast.to(data.token).emit('new_typing', {
      room: data.token,
      userTyping: true
    });
  });

  socket.on('blur', (data) => {
    socket.broadcast.to(data.token).emit('new_blur', {
      room: data.token,
      userTyping: true
    });
  });

  socket.on('message', (data) => {
    io.in(data.token).emit('new_message', data);
  });

  socket.on('onMessage', (data) => {
  });
});

// io.in('5b9a99f1c76651181cc80da85b9a72609e47b70f8878f51e').emit('new_msg', { msg: 'Hello'});

app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next)=>{
  loggerServices.writeStackTrace('INTERNAL SERVER ERROR, STATUS CODE: 500', error.stack);
  res.status(error.status || 500);
  res.json({
    success: false,
    message: 'Internal Server Error occured',
    stack: error.stack,
    rac: error.message
  })
});




