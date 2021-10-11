let express = require('express');
let postData = require("../public/posts.json");
let userDatabase = require("../userDatabase.json");

let router = express.Router(); 

  /* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', postData);
});

/* GET home page. */
router.get('/blog', function(req, res, next) {
  res.render('blog', postData);
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Log in' });
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
    res.render('loggedIn', { title: 'You are logged in!' });
  } else {
    res.status(400).json("ERRROORRRRR");
  };
})

router.get('/loggedIn', function(req, res, next) {
  res.render('loggedIn', { title: 'logged in '});
});


router.get('/newPost', function(req, res){
  res.render('newPost', { title: 'new post!' });
});

//adds a new post to posts.json
router.post('/newPost', function (req, res, next) {
  let { title, content, author } = req.body;
  postData.entries.unshift({
    id: "p" + (postData.entries.length + 1),
    author: author,
    title: title,
    content: content,        
    date: new Date()
  })
  res.render('index', postData);
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