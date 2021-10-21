const { json } = require('express');

let express = require('express');

let { MethodNotAllowed } = require('http-errors');

let router = express.Router();

let userDatabase = require("../userDatabase.json");

let postData = require("../public/posts.json");

///////////////////////////////////////////

//SECURITY STUFF

let loggedIn = false;

let crypto = require('crypto');

const iterations = 1000;

const hashSize = 64;

const hashAlgorithm = 'sha256';

const salt = crypto.randomBytes(256).toString('hex');

//need to change the salt
function emailHash(theEmail) {
  return crypto.pbkdf2Sync(theEmail, 'SALTYYY', iterations, hashSize, hashAlgorithm).toString('hex');
}

function passwordHash(thePassword) {
return crypto.pbkdf2Sync(thePassword, 'SALTYYY', iterations, hashSize, hashAlgorithm).toString('hex');
}

function validateLoginData(data) { 
  let found = false;
  for (let i = 0; i < userDatabase.users.length; i++) {               
    if (emailHash(data.email) === userDatabase.users[i].email && passwordHash(data.password) === userDatabase.users[i].password) {      
      found = true;
    } 
  }
  return found
}

///////////////////////////////////////////

let newArray = {
  "entries": [] 
}

function mostRecentFive() {
  for (let i = 0; i < 5; i++){
    newArray.entries.pop()    
  }
  for (let i = 0; i < 5; i++){
    newArray.entries.push(postData.entries[i])    
  }
}

  /* GET home page. */
router.get('/', function(req, res, next) {    
  mostRecentFive(); //most recent five necesary as database lives in the air and dumps on refresh currently.
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

/* GET name page (comp 280 handlebars variable tutorial) */
router.get('/name', function(req, res, next) {
  res.render('name', { name: req.query.name });
});

/* POST login data to validate login page */
router.post('/login', function(req, res, next){
  if (validateLoginData(req.body)) {    
    logInStatus = true;
    loggedIn = true;
    res.render('loggedIn', { title: 'You are logged in!' });
  } else {
    res.status(400).json("failed credentials");
  };
})

/*GET logged in page (dashboard) */
router.get('/loggedIn', function(req, res, next) {
  res.render('loggedIn', { title: 'logged in ' });
});

/*GET new post form page */
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
    password: hash(password),
    posts: 0,
    joined: new Date()
  })
  res.json(userDatabase.users[userDatabase.users.length-1]);
});

module.exports = router;