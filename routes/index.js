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

///////////////////// SQL DATABASE STUFF ////////////
/* Database setup endpoint */

router.get('/setup', (req, res, next) => {
  let db = req.app.locals.db;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  db.serialize( () => {
    //delete the table if it exists..
    db.run('DROP TABLE IF EXISTS `test`');

    db.run('CREATE TABLE `test` ( name varchar(255), amount INT )');

    //create test rows
    let rows = [
      ['test', 42],
      ['gold', 1337],
      ['bread', 42],
      ['ready meal', 42],
    ];

    rows.forEach( (row) => {
      db.run('INSERT INTO `test` VALUES(?,?)', row);
    });
  })
  res.render("test-db-done");
})

const SQL_GET_TEST = "SELECT * FROM test"; //sql command

router.get('/test', (req, res, next) => {
  let db = req.app.locals.db;

  db.all(SQL_GET_TEST, [], (err, rows) => {
    if (err) {
      //something went wrong
      res.status(500).send(err.message);
      return;
    }

    //everything goes right..
    res.render('test-db', { "rows": rows  });
  })
})

const SQL_UPDATE_TEST = "UPDATE test SET amount = ? WHERE name = ?";

router.post('/test', (req, res, next) => {

var form = req.body;
let db= req.app.locals.db;

// do validation

var errors = [];

if (!form.amount || !form.name) {
  errors.push("name or amount missing");
}

// TODO check that amount is positive
// TODO check that name is at least 3 chars long
// TODO (harder) check that name only contains [a-z0-9]
// Just incase Warwick doesn't get the regex ( sorry Warwick :) )
// that means numbers and letters only.

// are there errors?
if (  errors.length ) {
  // TODO we should handle this better
  // maybe display a form with the errors
  // and the user submitted data, prefilled in.

  res.status(400).send(errors);
  return;
}

// no errors, update database.
var params = [ form.amount, form.name ];
db.run(SQL_UPDATE_TEST, params, function(err, result) {
  if (err) {
    //TODO we should handle this better, maybe a pretty error page.
    res.status(500).send(err.message);
    return;
  }

  // show the page telling the user it worked.
  res.render('test-db-success', {  "params": params, "changes": this.changes })
})
})


const SQL_ADD_TEST = "INSERT INTO `test` VALUES(?,?)"
router.post('/test-add', (req, res, next) => {

  var form = req.body;
  let db= req.app.locals.db;

  var params = [ form.name, form.amount ];

  db.run(SQL_ADD_TEST, params, function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }  
     res.render('test-db-success', {  "params": params, "changes": this.changes })
   })
  })

const SQL_DELETE_TEST = "DELETE FROM `test` WHERE name = ?";

router.post('/test-delete', (req, res, next) => {

  var form = req.body;
  let db= req.app.locals.db;

  var params = [ form.name ];

  db.run(SQL_DELETE_TEST, params, function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }  
     res.render('test-db-success', {  "params": params, "changes": this.changes })
   })
  })
/////////////////////////////////////////////////////

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
  if (loggedIn) {
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
router.get('/register', function (req, res, next) {
  res.render('register')
})


//adds new user to user database
router.post('/register', function (req, res, next) {
  let { email, username, password1, password2 } = req.body; 
  if (req.body.password1 === req.body.password2){
    let storeEmail = emailHash(email);
    let storePassword = passwordHash(password2);
    userDatabase.users.push({
    id: userDatabase.users.length,
    name: username,
    email: storeEmail,
    password: storePassword,
    posts: 0,
    joined: new Date()
      })
      console.log(userDatabase.users)
  res.render('index');
    }
    else {
      res.render('register');
    }
});

module.exports = router;