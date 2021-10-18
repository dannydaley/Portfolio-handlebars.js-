const { json } = require('express');
let express = require('express');
const { MethodNotAllowed } = require('http-errors');
let router = express.Router();
let userDatabase = require("../userDatabase.json");

let postData = require("../public/posts.json");



let newArray = {
  "entries": [] 
}

let loggedIn = false;

function validateFormData(data) { 
    loggedIn = false;
  //is username and password correct?
  if (data.username === 'Danny' && data.password === 'password'){
    loggedIn = true;
    console.log("VALIDDDDDDD");    
  }  else {
    console.log("noooope")
    loggedIn = false;
  }
    return loggedIn;
}

  /* GET home page. */
router.get('/', function(req, res, next) {  
  for (let i = 0; i < 5; i++){
    newArray.entries.pop()    
  }
  for (let i = 0; i < 5; i++){
    newArray.entries.push(postData.entries[i])    
  }
  res.render('index', newArray);  
})

/* GET work page. */
router.get('/blog', function(req, res, next) {
  res.render('blog', postData);
});

/* GET workXML page. */
router.get('/blogXml', function(req, res, next) {
  res.render('blogXml');
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  if (loggedIn){
    res.render('loggedIn', { title: 'You are logged in!' });
}
  else {
    res.render('login', { title: 'Log in' });
  }})

  /* GET logOut page. */
router.get('/logOut', function(req, res, next) {
  loggedIn = false;
  res.render('index', newArray);
});

router.get('/name', function(req, res, next) {
  res.render('name', { name: req.query.name });
});

router.post('/login', function(req, res, next){
  let found = false;
  for (let i = 0; i < userDatabase.users.length; i++) {
    if (req.body.email === userDatabase.users[i].email && req.body.password === userDatabase.users[i].password) {      
      found = true;
    } 
  }
  if (found) {
    logInStatus = true;
    loggedIn = true;
    res.render('loggedIn', { title: 'You are logged in!' });
  } else {
    res.status(400).json("ERRROORRRRR");
  };
})

router.get('/loggedIn', function(req, res, next) {
  res.render('loggedIn', { title: 'logged in ' });
});

router.get('/newPost', function(req, res){
  res.render('newPost', { title: 'new post!' });
});

//adds a new post to posts.json
router.post('/newPost', function (req, res, next) {
  let { title, content, author, image } = req.body;
  if (image === ''){
    image = '/images/d2.png'
  }
  postData.entries.unshift({
  id: "p" + (postData.entries.length + 1),
  author: author,
  title: title,
  image: image,
  content: content,        
  date: new Date()
  });
  console.log(postData.entries.length)
  res.render('blog', postData);   
});

//adds new user to user database
router.post('/register', function (req, res, next) {
  let { email, name, password } = req.body;
  userDatabase.users.push({
    id: userDatabase.users.length,
    name: name,
    email: email,
    password: password,
    posts: 0,
    joined: new Date()
  })
  res.json(userDatabase.users[userDatabase.users.length-1]);
});

module.exports = router;