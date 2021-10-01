let express = require('express');
let postData = require("../posts.json");
let userDatabase = require("../userDatabase.json");

let router = express.Router(); 

  /* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Log in' });
});


router.get('/loggedIn', function(req, res, next) {
  res.render('loggedIn', { title: 'logged in '});
});

/* GET home page. */
router.get('/blog', function(req, res, next) {
  res.render('blog', postData);
});

router.get('/name', function(req, res, next) {
  res.render('name', { name: req.query.name });
});
////////////////////////////////////////////
//login validation
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
})




module.exports = router;
