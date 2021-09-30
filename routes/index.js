let express = require('express');
let router = express.Router();  






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

router.post('/login/', function(req, res, next) {
  let loginValid = validateFormData(req.body);
  if (loginValid){
    console.log("YEEEEEP");
    res.render('loggedIn', { username: req.body.username });
  } else {
    res.render('/login/', { name: undefined, password: undefined });
    console.log("NOOOOPE");
  }
});

router.get('/name/', function(req, res, next) {
  res.render('name', { name: req.query.name });
});

module.exports = router;