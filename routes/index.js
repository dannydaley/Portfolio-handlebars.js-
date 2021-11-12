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
const { debugPort } = require('process');

const iterations = 1000;

const hashSize = 64;

const hashAlgorithm = 'sha256';

const salt = crypto.randomBytes(256).toString('hex');

//need to change the salt
function emailHash(theEmail) {
  return crypto.pbkdf2Sync(theEmail, 'SALTYYY', iterations, hashSize, hashAlgorithm).toString('hex');
}

// function passwordHash(thePassword) {
// return crypto.pbkdf2Sync(thePassword, 'SALTYYY', iterations, hashSize, hashAlgorithm).toString('hex');
// }

function passwordHash(thePassword, saltGenerator) {
  return crypto.pbkdf2Sync(thePassword, 'PEPPERRRRR' + saltGenerator, iterations, hashSize, hashAlgorithm).toString('hex');
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


/////////////////////////////////////// SQL DATABASE STUFF /////////////////////////////////////////////

const GET_ALL_POSTS = "SELECT * FROM blog ORDER BY id DESC"; // SQL command
const GET_RECENT_POSTS = "SELECT * FROM blog ORDER BY id DESC LIMIT 5"; // SQL command
const SQL_ADD_BLOG_POST = "INSERT INTO `blog` VALUES(?,?,?,?,?,?,?)"
const SQL_UPDATE_BLOG =  "UPDATE blog SET  title = ?, image = ?, link = ?, author = ?, date = ?, content = ? WHERE id = ?" //SQL command

const GET_ALL_USERS = "SELECT * FROM users"; // SQL command


/* Database setup endpoint */
router.get('/SQLDatabaseUserSetup', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  SQLdatabase.serialize( () => {
    //delete the table if it exists..
    SQLdatabase.run('DROP TABLE IF EXISTS `users`');
    SQLdatabase.run('CREATE TABLE `users` ( id int, name varchar(255), email varchar(255), password varchar(255), passwordSalt varchar(512), posts int, joined varchar(255))');
    //create test rows
    let rows = [
      [123, 'Danny', 'dannydaley@outlook.com', '87a3076ac12037bb393584b1bc2497e71c6845c17aa6a9826152d3f69875de9289b30d4df75e844872175cfec1793dd7eccbf3f9669a11b05665ee0246e384d0','741461f3d0c446c1fde2b9c88df4d27593fad72af347cbd8773bc24971b2490622fae43cc7310d0b226254b70c83550d4c09c387fedd5622deb84e606cc3aa9d9036e27649d2bd9ebdf7e4a5b5c61371b65685fabf87c3838f2dacc7ebaecd7c7748503c1dec6665c54414a182d038ffb3b2dcf957a2397b02d06a97320cdee1db7932779a3a32058b62d796b0aa5a493018fafd4a6bc00f54af1e8fa9af930965249d12dfc906c4dd99626513b9faf12f918c3934c0956843a57d583db22c4fd80e1ae49a5a050422498c73675d64a25da1c1f3e4972e348b96949d989f85410f6141b2bdd4c1ba8f2613b14ab437d6770ae658f8a82f692e45a2df05196ae1', '0', 'new Date()'],
      [124, 'Danny', 'dandaley@email.com', 'bedb5e0ea27c1bcdba8eab671909819673eb0c87bd9c47f61a4163b74f494bfd1f4c4dfef209df4f30f8baa7fd3867f92d706b4dc8b6ee699b021615e0a6e7e7','4aae2963b54bdf7aa63fa8a3a8af791ddbd3ee1f8a5f7169ee4cb2c107ddadc3b84310e9761e3bbac1572c7d264026200dcdb6c97e0b24bbe18542bc51a062e6be3deeb39b9a99ec964cba5cfcd340bf4b719d7cbc3ea8dc3c317592ed391771b279427d04c296c5be94c25ac828e6fa5906ac8b820d7611d85c836ac1ee4acd26496e4665bfa711361a13165bbecdb79afc47b70b46e9d05487ac01ad87249042e8d916b59e4231231550bca5e1f0e3b2ffad1d33edbbf10f69a350f6753c9b37665e468a5bfc275ba834474197a91c1dc2b9e1cfc4d4746e912bfd4cf404f9d34b560e3c23fdc56a0d78d3cadbf49b3c727c0fca7ac1a9eb6c7cd2d63a41da', '0', 'new Date()'],
    ]
    rows.forEach( (row) => {
      SQLdatabase.run('INSERT INTO `users` VALUES(?,?,?,?,?,?,?)', row);
    });
  })
  res.render("user-db-done");
})
router.get('/SQLDatabaseBlogSetup', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  SQLdatabase.serialize( () => {
    //delete the table if it exists..
    SQLdatabase.run('DROP TABLE IF EXISTS `blog`');

    SQLdatabase.run('CREATE TABLE `blog` ( id INT, author varchar(255), title varchar(255), image varchar(255), content varchar(2000), link varchar(255), date varchar(255) )');
    //create test rows
    let rows = [
      [1, 'Danny', 'JavaScript Magic 8-ball', 'images/eightBall.png', 'Had some fun and made a small Magic 8-Ball web app using some basic HTML, CSS shapes and some simple JavaScript switch statement logic.', 'https://dannydaley.github.io/eightBall/', '2020, 2, 28'],
      [2, 'Danny', 'Captive Design Studio', 'images/cap.png', 'I had a great time working on the Captive Design Studio site, the use of strong fonts and powerful colors was an absolute must to pull this design off and it came out looking fantastic. Definitely learned a lot about making an impact from this one.', 'https://dannydaley.github.io/captivedesign/', '2020, 6, 15'],
      [3, 'Danny', 'Makkio Ikui', "images/makki.png", "Inspired by the Kawaii japanese art style, of course this website was a lot of fun to make, a great use of color in the design really made it pop. It came with its challenges, but its hard to stay frustrated when you're working with these kind of images.", 'https://dannydaley.github.io/makkioikui/', '2020, 4, 29'],
      [4, 'Danny', 'Final Fantasy VII:R Product Page', 'images/7.png', 'Being a massive Final Fantasy fan, upon the release of FFVII:Remake I felt it was 100% necessary to make it the theme of my responsive web design submission for freeCodeCamp. I particularly enjoyed making a theme with a darker appeal, and using that very FF7 Mako green.', 'https://codepen.io/dannydaley/full/RwWdVEp', '2021, 5, 8'],
      [5, 'Danny', 'SmartBrain - Face Recognition App', 'images/smartbrain.png', 'This face recognition app allows you to scan any image-link for faces within the picture, this is my first project fully leveraging an API, and a fully built back-end, allowing user registration, login and a rank based on how many images that user has entered. The data held within the database is secure, using encryption technologies such as Bcrypt.', 'https://smartbrain902101.herokuapp.com/', '2021, 4, 17'],
      [6, 'Danny', 'Version 3 launched!', 'images/v3.png', "Getting well enough ahead on my university work left me with a good amount of time to build version 3 of my portfolio website. After learning the Wordpress content management system and having a reasonable amount of fun with PHP, everything is working better than ever and creating new posts has never been easier! With that out of the way I've already been thinking about getting some user registration involved so users will be able to comment on future posts and lots of cool things that. Stay tuned!",'#', '2021, 3, 19'],
      [7, 'Danny', 'Unshore', 'images/unshorelogo2.png', "Unshore was a great game to work on for my first project in Falmouth University’s Games Academy. Taking the role of UI Programmer was a great chance to to have some some fun in the Unity game engine whilst being part of a multifaceted team. The theme we were given was Cornwall and “a famous dead person”, we figured that a dark horror styled game of chasing evil piskies around the island of Saint Michaels Mount while being hunted by King Arthurs ghost was pretty bang on.",'#', '2021, 2, 28']
    ]
    rows.forEach( (row) => {
      SQLdatabase.run('INSERT INTO `blog` VALUES(?,?,?,?,?,?,?)', row);
    });
  })
  res.render("blog-db-done");
})
router.get('/manageBlog', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_ALL_POSTS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.render('manageBlog', { "rows": rows });
  })
})
router.post('/manageBlog', (req, res, next) => {
  var form = req.body;
  let SQLdatabase = req.app.locals.SQLdatabase;
  // do the validation
  var errors = [];
  if (!form.title || !form.image || !form.link || !form.author || !form.date || !form.content){
    errors.push("Cannot have blank fields");
  }
  if (errors.length){
    res.status(400).send(errors);
    return;
  }
  var params = [ form.title, form.image, form.link, form.author, form.date, form.content, form.id ];
  SQLdatabase.run(SQL_UPDATE_BLOG, params, function(err, result){
    if (err) {
      res.status(500).send(err.message)
      return;
    }    
    res.render("blog-db-done");
  })
})

//////////////////////////////////// WORKSHOP STUFF //////////////////////////////////////////////////////////////
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
router.post('/newBlogPost', (req, res, next) => {
  var form = req.body;
  let blogDb = req.app.locals.blogDb;
  var params = [ form.title, form.image, form.link, form.author, form.date, form.content, form.id ];
  blogDb.run(SQL_ADD_BLOG_POST, params, function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.render("blog-db-done");
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
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_RECENT_POSTS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.render('index', { "rows": rows });
  })
})

/* GET work SQL page */
router.get('/blog', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_ALL_POSTS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.render('blog', { "rows": rows });
  })
})
/* GET work SQL page */
router.get('/getAllUsers', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_ALL_USERS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.json(rows);
  })
})

/* GET workJSON page. */
router.get('/blogJson', function(req, res, next) {
  res.render('blogJson', postData);
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
router.post('/login', (req, res, next) => {
  let data = req.body;
  let SQLdatabase = req.app.locals.SQLdatabase;
  let db = SQLdatabase;
  const FIND_USER = "SELECT * FROM users WHERE email = ? AND password = ?"   
    db.get(FIND_USER, [data.email, passwordHash(data.password, db.get("SELECT passwordSalt FROM users WHERE email = ?", [data.email], (err, row) => {
            if (err) {
              console.log("ERRRORRRR")
              res.status(500).send(err); 
            }
            // console.log(row.passwordSalt);
            return row.passwordSalt;
          }))], (err, rows) => {  
      if (err) {        
        found = false;
        res.status(500).send(err);                 
      }    
      if (rows !== undefined){    
        logInStatus = true;
        loggedIn = true;                  
        res.render('loggedIn', { title: 'You are logged in!' });  
      }
      else {
        found = false;
        console.log(JSON.stringify(passwordHash(data.password)))
        res.json("INVALID EMAIL OR PASSWORD");
      }       
    })   
})
// let validateSQLLogin = (request, data) => {
//   let found = false;
//   let SQLdatabase = request.app.locals.SQLdatabase;
//   let db = SQLdatabase;
//   const FIND_USER = "SELECT * FROM users WHERE email = ? AND password = ?"   
//     db.get(FIND_USER, [data.email, passwordHash(data.password, db.get("SELECT passwordSalt FROM users WHERE email = ?", [data.email], (err, row) => {
//       if (err) {
//         console.log("fucked it")
//         return;
//       }
//       console.log(row);
//       return row;
//     }))], (err, rows) => {        
//       if (err) {        
//         return found;                         
//       }    
//       if (rows !== undefined){    
//         logInStatus = true;
//         loggedIn = true;  
//         found = true;
//         return found;          
//       }
//       else {
//         found = false;
//         console.log(passwordHash(data.password, db.get("SELECT passwordSalt FROM users WHERE email = ?", [data.email], (err, row) => {
//       if (err) {
//         console.log("fucked it")
//         return;
//       }
//       console.log(row);
//       return row;
//     })))
//         res.json("INVALID EMAIL OR PASSWORD");
//       }   
//     })
//     return found;
// }

/* POST login data to validate login page */
// router.post('/login', (req, res, next) => {
//   let request = req;
//   let data = req.body;
//     if (validateSQLLogin(request, data)) {
//       res.render('loggedIn', { title: 'You are logged in!' });
//     }
//     res.json("INVALID EMAIL OR PASSWORD");
// })
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
// router.post('/register', function (req, res, next) {
//   let { email, username, password1, password2 } = req.body; 
//   if (req.body.password1 === req.body.password2){
//     let storeEmail = emailHash(email);
//     let storePassword = passwordHash(password2);
//     userDatabase.users.push({
//     id: userDatabase.users.length,
//     name: username,
//     email: storeEmail,
//     password: storePassword,
//     posts: 0,
//     joined: new Date()
//       })
//       console.log(userDatabase.users)
//   res.render('index');
//     }
//     else {
//       res.render('register');
//     }
// });

module.exports = router;


//SECURITY STUFF

// let loggedIn = false;

// let crypto = require('crypto');
// const { debugPort } = require('process');

// const iterations = 1000;

// const hashSize = 64;

// const hashAlgorithm = 'sha256';

// const pepper = crypto.randomBytes(256).toString('hex'); // NOT USED BUT THIS IS HOW A RANDOM PEPPER WOULD WORK.

//need to change the salt
// function emailHash(theEmail) {
//   return crypto.pbkdf2Sync(theEmail, 'PEPPERRRRR', iterations, hashSize, hashAlgorithm).toString('hex');
// }



// function validateLoginData(data) { 
//   let found = false;
//   for (let i = 0; i < userDatabase.users.length; i++) {
//       console.log(passwordHash(data.password, userDatabase.users[i].passwordSalt));
//       console.log(userDatabase.users[i].password)                
//     if (emailHash(data.email) === userDatabase.users[i].email && passwordHash(data.password, userDatabase.users[i].passwordSalt) === userDatabase.users[i].password) {  
  
//       found = true;
//     } 
//   }
//   return found
// }

// ///////////////////////////////////////////
// /* POST login data to validate login page */
// router.post('/login', function(req, res, next){
//   if (validateLoginData(req.body)) {    
//     logInStatus = true;
//     loggedIn = true;
//     res.render('loggedIn', { title: 'You are logged in!' });
//   } else {
//     res.status(400).json("failed credentials");
//   };
// })

//adds new user to user database
router.post('/register', function (req, res, next) {
  let { email, username, password1, password2 } = req.body; 
  if (req.body.password1 === req.body.password2){
    let storeEmail = emailHash(email);
    // gensalt
    let generateSalt = crypto.randomBytes(256).toString('hex');
    let storePassword = passwordHash(password2, generateSalt);
    
    userDatabase.users.push({
    id: userDatabase.users.length,
    name: username,
    email: email,
    password: storePassword,
    passwordSalt: generateSalt,
    posts: 0,
    joined: new Date()
      })

      console.log(JSON.stringify(userDatabase))
      res.render('index');
    }
    else {
      res.render('register');
    }
});
