const { json } = require('express');

let express = require('express');

let { MethodNotAllowed } = require('http-errors');

let router = express.Router();

let postDataJSON = require("../public/posts.json");

var fs = require('fs');

// variable responsible for greeting user on login
let name = 'User';

// variable that changes "login" to "dashboard" on nav
let isLoggedIn = false;

// switch nav link according to isLoggedIn status
let changeNavLoginButton = (loggedInStatus) => {
  if (loggedInStatus) {
    return "dashboard";
  } else {
    return "log in"
  }
}

///////////////////////////////////////////
//SECURITY STUFF

let crypto = require('crypto');

const { debugPort } = require('process');

const iterations = 1000;

const hashSize = 64;

const hashAlgorithm = 'sha256';

function passwordHash(thePassword, theSalt) {
  //generatePepper = crypto.randomBytes(256).toString('hex');
  const pepper = '6982cdde8310b6e9db3ead1798838ee72373be2a742cf69c17376c753976712e9fba11f4b4f225f82ea3a36afd903603ea96f2434e505ae2441094058d605d201470a388556bbdd5903dd081ba183d06f6fb11de85464f30770a9dd6ecee8e472d56295872692f092f90c835aecd0ae45bc0c0dd7acfa730a65ef9493ea8228d5a870d52488bfa5462d25093926ba7137f63975c71e6fc92851bc99c81f4ffc3c1408e4803f07940f704b942d979d6050f9e9c580b6f8820d992e290104fcdfe813e9cc60a351c2022cb2c9b6cb97c6c44dbac11b75463907817740ab3b312c597bd83ef128525c61495a3656c9ee08bd587c60def2e0d8a2100c1b34dbe7528';
  return crypto.pbkdf2Sync(thePassword, pepper + theSalt, iterations, hashSize, hashAlgorithm).toString('hex');
}

/////////////////////////////////////// SQL DATABASE STUFF /////////////////////////////////////////////

const GET_ALL_POSTS = "SELECT * FROM `blog` ORDER BY id DESC"; // SQL command
const GET_RECENT_POSTS = "SELECT * FROM blog ORDER BY id DESC LIMIT 5"; // SQL command
const GET_POSTS_BY_AUTHOR = "SELECT * FROM `blog` WHERE author = ? ORDER BY id DESC"
const GET_RECENT_POSTS_BY_AUTHOR = "SELECT * FROM blog WHERE author = ? ORDER BY id DESC LIMIT 5"; // SQL command
const SQL_ADD_BLOG_POST = "INSERT INTO `blog` (author, title, image, content, link, date) VALUES(?,?,?,?,?,?)"
const SQL_UPDATE_BLOG =  "UPDATE `blog` SET title = ?, image = ?, link = ?, author = ?, date = ?, content = ? WHERE id = ?" //SQL command
const GET_ALL_USERS = "SELECT * FROM users"; // SQL command

/* Database setup endpoint */
router.get('/SQLDatabaseUserSetup', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  SQLdatabase.serialize( () => {
    //delete the table if it exists..
    SQLdatabase.run('DROP TABLE IF EXISTS `users`');
    SQLdatabase.run('CREATE TABLE `users` (id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(255), email varchar(255) UNIQUE, password varchar(255), passwordSalt varchar(512), posts int, joined varchar(255))');
    //create test rows
    let rows = [
      ['Danny', 'dannydaley@outlook.com', '493509dac1a23de8901b9564acea549d6d9d3ae960062978d90feef9bd77f2b4399a61bc396389119fbb7069f2dac7520497dc8ac733a98b4a734af8e4cf4883','8dc317df7da5cbc21859fe9e3fa07cb9cc81bbd1d58da2747d4282c4d9abbf2f372a8c73f68b7ef323a08b98da1401d8b639b1310f8094c7a1950e4a85300f70f7a92536b4b1a860bf759128ac9632b807100f48af7f906fbf14d27f4a16293eccb024f5182db76f356a3644a4c542ff35a17bd3a7b19a757a2fa318fbd3a45e62129a10fa481503233e9a998518b91430244157e328e7129c84a0d478e7d3c2360f0357d5b1a64d0d70de494436dcb84798bf8b629ee2089683e1b5d4faca23b1c5c43d031928684be00ce96b42a73269ddadf688c6737458642b5100d9db29be6594f327f4b44234786ecd407b2c98e52d766439e7742ac937ca58811b284c', 0, new Date()],
      ['Danny', 'dandaley@email.com', 'bedb5e0ea27c1bcdba8eab671909819673eb0c87bd9c47f61a4163b74f494bfd1f4c4dfef209df4f30f8baa7fd3867f92d706b4dc8b6ee699b021615e0a6e7e7','4aae2963b54bdf7aa63fa8a3a8af791ddbd3ee1f8a5f7169ee4cb2c107ddadc3b84310e9761e3bbac1572c7d264026200dcdb6c97e0b24bbe18542bc51a062e6be3deeb39b9a99ec964cba5cfcd340bf4b719d7cbc3ea8dc3c317592ed391771b279427d04c296c5be94c25ac828e6fa5906ac8b820d7611d85c836ac1ee4acd26496e4665bfa711361a13165bbecdb79afc47b70b46e9d05487ac01ad87249042e8d916b59e4231231550bca5e1f0e3b2ffad1d33edbbf10f69a350f6753c9b37665e468a5bfc275ba834474197a91c1dc2b9e1cfc4d4746e912bfd4cf404f9d34b560e3c23fdc56a0d78d3cadbf49b3c727c0fca7ac1a9eb6c7cd2d63a41da', 0, new Date()],
    ]
    rows.forEach( (row) => {
      SQLdatabase.run('INSERT INTO `users` (name, email, password, passwordSalt, posts, joined) VALUES(?, ?, ?, ?, ?, ?)', row);
    });
  })
  res.render("user-db-done", { loggedIn: changeNavLoginButton(isLoggedIn) });
})
router.get('/SQLDatabaseBlogSetup', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  SQLdatabase.serialize( () => {
    //delete the table if it exists..
    SQLdatabase.run('DROP TABLE IF EXISTS `blog`');

    SQLdatabase.run('CREATE TABLE `blog` ( id INTEGER PRIMARY KEY AUTOINCREMENT, author varchar(255), title varchar(255), image varchar(255), content blob, link varchar(255), date varchar(255) )');
    //create test rows
    let rows = [
      [1, 'Danny', 'JavaScript Magic 8-ball', 'images/eightBall.png', 'Had some fun and made a small Magic 8-Ball web app using some basic HTML, CSS shapes and some simple JavaScript switch statement logic.', 'https://dannydaley.github.io/eightBall/', '2020-02-28'],
      [2, 'Danny', 'Captive Design Studio', 'images/cap.png', 'I had a great time working on the Captive Design Studio site, the use of strong fonts and powerful colors was an absolute must to pull this design off and it came out looking fantastic. Definitely learned a lot about making an impact from this one.', 'https://dannydaley.github.io/captivedesign/', '2020-03-15'],
      [3, 'Danny', 'Makkio Ikui', "images/makki.png", "Inspired by the Kawaii japanese art style, of course this website was a lot of fun to make, a great use of color in the design really made it pop. It came with its challenges, but its hard to stay frustrated when you're working with these kind of images.", 'https://dannydaley.github.io/makkioikui/', '2020-04-29'],
      [4, 'Danny', 'Final Fantasy VII:R Product Page', 'images/7.png', 'Being a massive Final Fantasy fan, upon the release of FFVII:Remake I felt it was 100% necessary to make it the theme of my responsive web design submission for freeCodeCamp. I particularly enjoyed making a theme with a darker appeal, and using that very FF7 Mako green.', 'https://codepen.io/dannydaley/full/RwWdVEp', '2020-05-08'],
      [5, 'Danny', 'SmartBrain - Face Recognition App', 'images/smartbrain.png', 'This face recognition app allows you to scan any image-link for faces within the picture, this is my first project fully leveraging an API, and a fully built back-end, allowing user registration, login and a rank based on how many images that user has entered. The data held within the database is secure, using encryption technologies such as Bcrypt.', 'https://smartbrain902101.herokuapp.com/', '2020-09-17'],
      [6, 'Danny', 'Version 3 launched!', 'images/v3.png', "Getting well enough ahead on my university work left me with a good amount of time to build version 3 of my portfolio website. After learning the Wordpress content management system and having a reasonable amount of fun with PHP, everything is working better than ever and creating new posts has never been easier! With that out of the way I've already been thinking about getting some user registration involved so users will be able to comment on future posts and lots of cool things that. Stay tuned!",'#', '2020-12-19'],
      [7, 'Danny', 'Unshore', 'images/unshorelogo2.png', "Unshore was a great game to work on for my first project in Falmouth University’s Games Academy. Taking the role of UI Programmer was a great chance to to have some some fun in the Unity game engine whilst being part of a multifaceted team. The theme we were given was Cornwall and “a famous dead person”, we figured that a dark horror styled game of chasing evil piskies around the island of Saint Michaels Mount while being hunted by King Arthurs ghost was pretty bang on.",'#', '2021-02-28']
    ]
    rows.forEach( (row) => {
      SQLdatabase.run('INSERT INTO `blog` VALUES(?,?,?,?,?,?,?)', row);
    });
  })
  res.render("blog-db-done", { loggedIn: changeNavLoginButton(isLoggedIn) });
})

/*========================DEBUGGING AND TESTING ENDPOINTS========================*/
/* GET all users */
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

/* GET all blog posts */
router.get('/getAllPosts', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_ALL_POSTS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.json(rows);
  })
})
/*==================END OF DEBUGGING AND TESTING ENDPOINTS========================*/



//////////////////////////////////// WORKSHOP STUFF //////////////////////////////////////////////////////////////
// router.get('/setup', (req, res, next) => {
//   let db = req.app.locals.db;
//   //these queries must run one by one - dont try and delete and create tables at the same time.
//   db.serialize( () => {
//     //delete the table if it exists..
//     db.run('DROP TABLE IF EXISTS `test`');
//     db.run('CREATE TABLE `test` ( name varchar(255), amount INT )');
//     //create test rows
//     let rows = [
//       ['test', 42],
//       ['gold', 1337],
//       ['bread', 42],
//       ['ready meal', 42],
//     ];
//     rows.forEach( (row) => {
//       db.run('INSERT INTO `test` VALUES(?,?)', row);
//     });
//   })
//   res.render("test-db-done", { loggedIn: changeNavLoginButton(isLoggedIn) });
// })
// const SQL_GET_TEST = "SELECT * FROM test"; //sql command
// router.get('/test', (req, res, next) => {
//   let db = req.app.locals.db;
//   db.all(SQL_GET_TEST, [], (err, rows) => {
//     if (err) {
//       //something went wrong
//       res.status(500).send(err.message);
//       return;
//     }
//     //everything goes right..
//     res.render('test-db', { "rows": rows  });
//   })
// })
// const SQL_UPDATE_TEST = "UPDATE test SET amount = ? WHERE name = ?";
// router.post('/test', (req, res, next) => {
// var form = req.body;
// let db= req.app.locals.db;
// // do validation
// var errors = [];
// if (!form.amount || !form.name) {
//   errors.push("name or amount missing");
// }

// // are there errors?
// if (  errors.length ) {


//   res.status(400).send(errors);
//   return;
// }
// // no errors, update database.
// var params = [ form.amount, form.name ];
// db.run(SQL_UPDATE_TEST, params, function(err, result) {
//   if (err) {
//     //TODO we should handle this better, maybe a pretty error page.
//     res.status(500).send(err.message);
//     return;
//   }
//   // show the page telling the user it worked.
//   res.render('test-db-success', {  "params": params, "changes": this.changes })
//   })
// })
// const SQL_ADD_TEST = "INSERT INTO `test` VALUES(?,?)"
// router.post('/test-add', (req, res, next) => {
//   var form = req.body;
//   let db= req.app.locals.db;
//   var params = [ form.name, form.amount ];
//   db.run(SQL_ADD_TEST, params, function(err, result) {
//     if (err) {
//       res.status(500).send(err.message);
//       return;
//     }  
//      res.render('test-db-success', {  "params": params, "changes": this.changes })
//    })
// })


// const SQL_DELETE_TEST = "DELETE FROM `test` WHERE name = ?";
// router.post('/test-delete', (req, res, next) => {
//   var form = req.body;
//   let db= req.app.locals.db;
//   var params = [ form.name ];
//   db.run(SQL_DELETE_TEST, params, function(err, result) {
//     if (err) {
//       res.status(500).send(err.message);
//       return;
//     }  
//      res.render('test-db-success', {  "params": params, "changes": this.changes })
//    })
// })

/////////////////////////////////////////////////////

/* GET home page. */
router.get('/', function(req, res, next) {    
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_RECENT_POSTS_BY_AUTHOR, ["Danny"], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.render('index', { title: "dannydaley","rows": rows, loggedIn: changeNavLoginButton(isLoggedIn) });  
  })
})

/* GET work SQL page */
router.get('/blog', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_POSTS_BY_AUTHOR, [ "Danny" ], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.render('blog', { title: "work", "rows": rows, loggedIn: changeNavLoginButton(isLoggedIn) });
  })
})

/* GET community work SQL page */
router.get('/community-blog', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_ALL_POSTS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.render('blog', { title: "community blog", "rows": rows, loggedIn: changeNavLoginButton(isLoggedIn) });
  })
})

/* GET workJSON page. */
router.get('/blogJson', function(req, res, next) {
  res.render('blogJson', { title: "work.JSON", postDataJSON, loggedIn: changeNavLoginButton(isLoggedIn) });
});
// //adds a new post to posts.json
// router.post('/newPost', function (req, res, next) {
//   let { title, content, author, image } = req.body;
//   if (image === ''){
//     image = '/images/d2.png'
//   }
//   postData.entries.unshift({
//   id: "p" + (postData.entries.length + 1),
//   author: author,
//   title: title,
//   image: image,
//   content: content,        
//   date: new Date()
//   });  
//   res.render('blog', postData);   
// });

/* GET workXML page. */
router.get('/blogXml', function(req, res, next) {
  res.render('blogXml', { title: "work.XML",loggedIn: changeNavLoginButton(isLoggedIn) });
});



router.get('/register', function (req, res, next) {
  res.render('register',{ title: "register",loggedIn: changeNavLoginButton(isLoggedIn) })
})
//adds new user to user database
router.post('/register', function (req, res, next) {
  let { email, username, password1, password2 } = req.body; 
  if (req.body.password1 === req.body.password2){    
    // gensalt
    let generateSalt = crypto.randomBytes(256).toString('hex');
    let storePassword = passwordHash(password2, generateSalt);  
    let SQLdatabase = req.app.locals.SQLdatabase;
    let db = SQLdatabase;
    db.run('INSERT INTO `users` (name, email, password, passwordSalt, posts, joined) VALUES(?, ?, ?, ?, ?, ?)',[username, email, storePassword, generateSalt, 0, new Date()], function(err, result) {
      if (err) {
        res.status(500).send(err.message);
        return;
      }  
       res.render('user-db-done', {  title: "registered", loggedIn: changeNavLoginButton(isLoggedIn) })     
    })
  }
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  if (isLoggedIn) {
    res.render('loggedIn', { name: name.toUpperCase(), title: 'You are logged in!', loggedIn: changeNavLoginButton(isLoggedIn) });
}
  else {
    res.render('login', { title: 'Log in', loggedIn: changeNavLoginButton(isLoggedIn) });
  }
})

/* POST login data to validate login page */
router.post('/login', (req, res, next) => {
  let data = req.body;
  let SQLdatabase = req.app.locals.SQLdatabase;
  let db = SQLdatabase;
  const FIND_USER = "SELECT * FROM users WHERE email = ?"   
    db.get(FIND_USER, [data.email], (err, rows) => {  
      if (err) {        
        found = false;
        res.status(500).send(err);               
      }      
      if (rows !== undefined && rows.password === passwordHash(data.password, rows.passwordSalt)){    
        name = rows.name;
        logInStatus = true;
        isLoggedIn = true;                  
        res.render('loggedIn', { name: name.toUpperCase(), title: 'You are logged in!', loggedIn: changeNavLoginButton(isLoggedIn) });  
      }
      else {
        found = false;        
        res.json("INVALID EMAIL OR PASSWORD");
      }       
    })   
})
/*GET logged in page (dashboard) */
router.get('/loggedIn', function(req, res, next) {
  res.render('loggedIn', { title: 'logged in ', loggedIn: changeNavLoginButton(isLoggedIn) });
});
  /* GET logOut page. */
router.get('/logOut', function(req, res, next) {
  isLoggedIn = false;
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_RECENT_POSTS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.render('index', { title: "logged out","rows": rows, loggedIn: changeNavLoginButton(isLoggedIn) });  
  })
})

router.get('/manageBlog', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.all(GET_POSTS_BY_AUTHOR, [name], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.render('manageBlog', { title: "manage blog","rows": rows,  loggedIn: changeNavLoginButton(isLoggedIn) });
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
  var params = [ form.title, form.image,form.link, form.author,  form.date, form.content, form.id  ];
  SQLdatabase.run(SQL_UPDATE_BLOG, params, function(err, result){
    if (err) {
      res.status(500).send(err.message)
      return;
    }    
    res.render("blog-db-done", { title: "blog updated",loggedIn: changeNavLoginButton(isLoggedIn) });
  })
})

/*GET new post form page */
router.get('/newPost', function(req, res){
  res.render('newPost', { title: 'new post', loggedIn: changeNavLoginButton(isLoggedIn), name: name });
});

router.post('/newBlogPost', (req, res, next) => {
  var form = req.body;
  let db = req.app.locals.SQLdatabase;  
  if (req.body.image === ""){
    //defaults the image field is left blank
    req.body.image = "/images/d2.png"
  }
  if (req.body.link === ""){
    //defaults the link to go nowhere
    req.body.link = "#"
  } 
  var params = [ form.author, form.title, form.image, form.content, form.link, form.date ];
  db.run(SQL_ADD_BLOG_POST, params, function(err, result) {
    console.log(form)
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.render("blog-db-done",{ loggedIn: changeNavLoginButton(isLoggedIn) });
  })
})

const BLOG_DELETE_POST = "DELETE FROM `blog` WHERE title = ?";
router.post('/post-delete', (req, res, next) => {
  var form = req.body;
  let db= req.app.locals.SQLdatabase;
  var postToDelete = form.deleteThisPost;
  db.run(BLOG_DELETE_POST, postToDelete, function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }  
     res.render('blog-db-done', { "changes": this.changes, loggedIn: changeNavLoginButton(isLoggedIn) })
   })
})


module.exports = router;