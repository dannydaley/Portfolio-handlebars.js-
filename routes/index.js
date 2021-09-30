let express = require('express');


let router = express.Router();  

let database = {
  users: [
    {
      id: '123',
      name: 'Danny',
      email: 'dannydaley@outlook.com',
      password: 'password',
      posts: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'DannyD1990',
      email: 'dandaley1990@hotmail.com',
      password: 'password123',
      posts: 0,
      joined: new Date()
    }
  ]
}




function validateFormData(data) { 
  let loggedIn = false;
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
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login/', function(req, res, next) {
  res.render('login', { title: 'Log in' });
});

router.get('/loggedIn/', function(req, res, next) {
  res.render('loggedIn', { title: 'logged in '});
});


////////////////////////////////////////////
router.post('/login/', function(req, res, next){
  let found = false;
  for (let i = 0; i < database.users.length; i++) {
    if (req.body.email === database.users[i].email && req.body.password === database.users[i].password) {      
      found = true;
    } 
  }
  if (found) {
    res.render('loggedIn', { title: 'You are logged in!' });
  } else {
    res.status(400).json("ERRROORRRRR");
  };
})

router.post('/register', function (req, res, next) {
  let { email, name, password } = req.body;
  database.users.push({
    id: database.users.length,
    name: name,
    email: email,
    password: password,
    posts: 0,
    joined: new Date()
  })
  res.json(database.users[database.users.length-1]);
})


router.get('/name/', function(req, res, next) {
  res.render('name', { name: req.query.name });
});

module.exports = router;