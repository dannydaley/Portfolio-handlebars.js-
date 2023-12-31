let express = require('express');

var app = express();

// set up router for endpoints
let router = express.Router();

/* DATE HANDLING */
const getDate = () => {
  let date = new Date()
  let dateDay = date.getDate();
  let dateMonth = date.getMonth() +1;
  let dateYear = date.getFullYear();
  return dateDay + "-" + dateMonth + "-" + dateYear
}
/* END OF DATE HANDLING */

/* IMAGE UPLOAD HANDLING */
//set up multer middleware for image uploads
var multer  = require('multer');

//set up storage location
const storage = multer.diskStorage({
  
  //set up save destination
  destination: function (req, file, cb) {  
    // different diestinations depending on whether its a profile picture or post picture
    //profile route 
    if (req.body.context === "profile"){
      cb(null, 'public/images/profilePictures')
    }  
    //post route
    if (req.body.context === "blogPost"){
     cb(null, 'public/images/uploads') 
    }
    if (req.body.context === "guestbook") {
      cb(null, 'public/images/guestbook')
    }
  }, //set up filename
  filename: function (req, file, cb) {
    if (file.fieldname !== undefined) {
      // delete the attached image
      if (req.body.image !== "/images/default-post-image.png" && req.body.image !== "images/defaultUser.png"){        
        fs.unlink('public/' + req.body.image, (err) => {
      //console.log error if error
        if (err) {
          console.log("error deleting image")
          console.log(err)
        }  
      });
    }  
    //create unique suffix for naming
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    if (req.body.context === "blogPost") {
      // create filename (author + filename + unique suffix + filetype)
      cb(null, req.body.author + '-' + file.fieldname + '-' + uniqueSuffix + '.png')
      // reset the request.body.image field with the image location + new filename to be put in the database as a link
      req.body.image = "/images/uploads/" + req.body.author + '-' + file.fieldname + '-' + uniqueSuffix + '.png'
    }
    if (req.body.context === "profile") {
      // create filename (author + filename + unique suffix + filetype)
      cb(null, req.session.userData.sessionUsername + '-' + file.fieldname + '-' + uniqueSuffix + '.png')
      // reset the request.body.image field with the image location + new filename to be put in the database as a link
      req.body.image = "images/profilePictures/" + req.session.userData.sessionUsername + '-' + file.fieldname + '-' + uniqueSuffix + '.png';
      }    
    if (req.body.context === "guestbook") {
      // create filename (author + filename + unique suffix + filetype)
      cb(null, req.session.userData.sessionUsername + '-' + file.fieldname + '-' + uniqueSuffix + '.png')
      // reset the request.body.image field with the image location + new filename to be put in the database as a link
      req.body.image = "/images/guestbook/" + req.session.userData.sessionUsername + '-' + file.fieldname + '-' + uniqueSuffix + '.png';
      }
    }
    // if upload image field on form is left blank..
    else {
      console.log("file fieldname is undefined")
      return
    }
  }
})

// set upload storage to the previously set up desitnation
const upload = multer({ storage: storage });
/* END OF IMAGE UPLOAD HANDLING */

//get the saved post information from external JSON file
// mainly for keeping up to date when new post are created etc
let postDataJSON = require("../public/posts.json");


// fs is needed for writing/deleting files
var fs = require('fs');


/*  SESSION STUFF   */

// function that changes the "log in" button to "dashboard" depending on the value of the argument
let changeNavLoginButton = (loggedInStatus) => {
  if (loggedInStatus) {
    return "dashboard";
  } else {
    return "log in"
  }
}

// returns true or false depending on if there is a session active ( this is passed into changeNavLoginButton as an argument )
const sessionExists = (request) => {
  // if session is active  
  if (request.session && request.session.userData && request.session.userData.sessionUserIsLoggedIn) {
    return true;
  }
  else {
    // otherwise return false
    return false;
  }
}
/* END OF SESSION STUFF */

///////////////////////////////////////    SECURITY    /////////////////////////////////////////////

// This stuff will be put into a .env file ( still to do )

// set up crypto middleware
let crypto = require('crypto');
const { captureRejectionSymbol } = require('events');

// number of iterations to jumble the hash
const iterations = 1000;

//set up char length of hash
const hashSize = 64;

// which hashing algorithm will be used
const hashAlgorithm = 'sha256';

// create a hash salt/pepper
const generatePepper = crypto.randomBytes(256).toString('hex');

//this function returns a hash of the password, combined with the pepper and the salt.
function passwordHash(thePassword, theSalt) {  
  const pepper = process.env.PEPPER;
   return crypto.pbkdf2Sync(thePassword, pepper + theSalt, iterations, hashSize, hashAlgorithm).toString('hex');
}

/////////////////////////////////////// SQL DATABASE STUFF /////////////////////////////////////////////


const GET_USER_PROFILE_INFO = "SELECT name, joined, posts, profilePicture, aboutMe, pinnedPost FROM users WHERE name = ?" // SQL command
const GET_ALL_POSTS = "SELECT * FROM `blog` ORDER BY id DESC"; // SQL command
const GET_ALL_POSTS_BY_RECIPIENT = "SELECT * FROM `blog` WHERE recipient = ? ORDER BY id DESC"; // SQL command
const GET_RECENT_POSTS = "SELECT * FROM blog WHERE recipient = ? ORDER BY id DESC LIMIT 5"; // SQL command
const BLOG_DELETE_POST = "DELETE FROM `blog` WHERE title = ? AND id = ?"; // SQL command
const GET_POSTS_BY_AUTHOR = "SELECT * FROM `blog` WHERE author = ? AND recipient = ? ORDER BY id DESC" // SQL command
const GET_RECENT_POSTS_BY_AUTHOR = "SELECT * FROM blog WHERE author = ? AND recipient = ? ORDER BY id DESC LIMIT 5"; // SQL command
const SQL_ADD_BLOG_POST = "INSERT INTO `blog` (author, title, image, content, link, date, recipient) VALUES(?,?,?,?,?,?,?)" // 
const SQL_UPDATE_BLOG =  "UPDATE `blog` SET title = ?, image = ?, link = ?, author = ?, content = ? WHERE id = ?" //SQL command
const SQL_UPDATE_USER_PROFILE = "UPDATE users SET profilePicture = ?, aboutMe = ? WHERE name = ?" // SQL command
const SQL_UPDATE_USERS_PINNED_POST = "UPDATE users SET pinnedPost = ? WHERE name = ?" // SQL command
const GET_ALL_USERS = "SELECT * FROM users"; // SQL command


/* Database setup endpoint */
// router.get('/SQLDatabaseUserSetup', (req, res, next) => {
//   let SQLdatabase = req.app.locals.SQLdatabase;
//   //these queries must run one by one - dont try and delete and create tables at the same time.
//   SQLdatabase.serialize( () => {
//     console.log("1")
//     //delete the table if it exists..
//     SQLdatabase.run('DROP TABLE IF EXISTS `users`');
//     console.log("2")
//     //recreate the users table
//     // SQLdatabase.query('CREATE TABLE `users` (id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(255) UNIQUE COLLATE NOCASE, email varchar(255) UNIQUE, password varchar(255), passwordSalt varchar(512), posts int, joined varchar(255), profilePicture varchar(255), aboutMe text, pinnedPost INTEGER)');
//     SQLdatabase.run('CREATE TABLE `users` (id INTEGER PRIMARY KEY AUTO_INCREMENT, name varchar(255) UNIQUE , email varchar(255) UNIQUE, password varchar(255), passwordSalt varchar(512), posts int, joined varchar(255), profilePicture varchar(255), aboutMe text, pinnedPost INTEGER)');
//     //create test rows
//     console.log("3")
//     let rows = []
//     let userDataJSON = require("../public/users.json");
//     for (let i = 0; i < userDataJSON.users.length; i++) {
//       rows[i] = [userDataJSON.users[i].name, userDataJSON.users[i].email, userDataJSON.users[i].password, userDataJSON.users[i].passwordSalt, userDataJSON.users[i].posts, userDataJSON.users[i].joined, userDataJSON.users[i].profilePicture,userDataJSON.users[i].aboutMe, userDataJSON.users[i].pinnedPost]
//     }
//     // add rows to database
//     rows.forEach( (row) => {
//       SQLdatabase.run('INSERT INTO `users` (name, email, password, passwordSalt, posts, joined, profilePicture, aboutMe, pinnedPost) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', row);
//     });
//   })
//   //render success page
//   res.render("user-db-done", { loggedIn: changeNavLoginButton(sessionExists(req))});
// })
/* Database setup endpoint */
router.get('/SQLDatabaseUserSetup', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  SQLdatabase.query( () => {
    //delete the table if it exists..
    SQLdatabase.query('DROP TABLE IF EXISTS `users`');
    //recreate the users table
    // SQLdatabase.query('CREATE TABLE `users` (id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(255) UNIQUE COLLATE NOCASE, email varchar(255) UNIQUE, password varchar(255), passwordSalt varchar(512), posts int, joined varchar(255), profilePicture varchar(255), aboutMe text, pinnedPost INTEGER)');
    SQLdatabase.query('CREATE TABLE `users` (id INTEGER PRIMARY KEY AUTO_INCREMENT, name varchar(255) UNIQUE , email varchar(255) UNIQUE, password varchar(255), passwordSalt varchar(512), posts int, joined varchar(255), profilePicture varchar(255), aboutMe text, pinnedPost INTEGER)');
    //create test rows
    let rows = []
    let userDataJSON = require("../public/users.json");
    for (let i = 0; i < userDataJSON.users.length; i++) {
      rows[i] = [userDataJSON.users[i].name, userDataJSON.users[i].email, userDataJSON.users[i].password, userDataJSON.users[i].passwordSalt, userDataJSON.users[i].posts, userDataJSON.users[i].joined, userDataJSON.users[i].profilePicture,userDataJSON.users[i].aboutMe, userDataJSON.users[i].pinnedPost]
    }
    // add rows to database
    rows.forEach( (row) => {
      SQLdatabase.query('INSERT INTO `users` (name, email, password, passwordSalt, posts, joined, profilePicture, aboutMe, pinnedPost) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', row);
    });
  })
  //render success page
  res.render("user-db-done", { loggedIn: changeNavLoginButton(sessionExists(req))});
})
// set up blog table in database
router.get('/SQLDatabaseBlogSetup', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  SQLdatabase.query( () => {
    //delete the table if it exists..
    SQLdatabase.query('DROP TABLE IF EXISTS `blog`');
    // create blog table
    SQLdatabase.query('CREATE TABLE `blog` ( id INTEGER PRIMARY KEY AUTO_INCREMENT, author varchar(255), title varchar(255), image varchar(255), content text, link varchar(255), date varchar(255), recipient varchar(255) )');
    //create base rows
    let rows = [];
    //loop through posts.json to populate rows array
    for (let i = 0; i < postDataJSON.entries.length; i++) {
      rows[i] = [postDataJSON.entries[i].id, postDataJSON.entries[i].author, postDataJSON.entries[i].title, postDataJSON.entries[i].image, postDataJSON.entries[i].content, postDataJSON.entries[i].link, postDataJSON.entries[i].date, postDataJSON.entries[i].recipient]
    }
    // populate SQL command with rows array populated from posts.json
    rows.forEach( (row) => {
      // insert rows to table
      SQLdatabase.query('INSERT INTO `blog` VALUES(?,?,?,?,?,?,?,?)', row);
      // increment users post count according to author of currently processed post
      SQLdatabase.query('UPDATE `users` SET `posts` = posts+1 WHERE name = ?',  row[1])
    });
  })
  // render success page
  res.render("blog-db-done", { loggedIn: changeNavLoginButton(sessionExists(req)) });
})
// // set up blog table in database
// router.get('/SQLDatabaseBlogSetup', (req, res, next) => {
//   let SQLdatabase = req.app.locals.SQLdatabase;
//   //these queries must run one by one - dont try and delete and create tables at the same time.
//   SQLdatabase.serialize( () => {
//     //delete the table if it exists..
//     SQLdatabase.run('DROP TABLE IF EXISTS `blog`');
//     // create blog table
//     SQLdatabase.run('CREATE TABLE `blog` ( id INTEGER PRIMARY KEY AUTOINCREMENT, author varchar(255) COLLATE NOCASE, title varchar(255), image varchar(255), content blob, link varchar(255), date varchar(255), recipient varchar(255) )');
//     //create base rows
//     let rows = [];
//     //loop through posts.json to populate rows array
//     for (let i = 0; i < postDataJSON.entries.length; i++) {
//       rows[i] = [postDataJSON.entries[i].id, postDataJSON.entries[i].author, postDataJSON.entries[i].title, postDataJSON.entries[i].image, postDataJSON.entries[i].content, postDataJSON.entries[i].link, postDataJSON.entries[i].date, postDataJSON.entries[i].recipient]
//     }
//     // populate SQL command with rows array populated from posts.json
//     rows.forEach( (row) => {
//       // insert rows to table
//       SQLdatabase.run('INSERT INTO `blog` VALUES(?,?,?,?,?,?,?,?)', row);
//       // increment users post count according to author of currently processed post
//       SQLdatabase.run('UPDATE `users` SET `posts` = posts+1 WHERE name = ?',  row[1])
//     });
//   })
//   // render success page
//   res.render("blog-db-done", { loggedIn: changeNavLoginButton(sessionExists(req)) });
// })

/*==============================DEBUGGING AND TESTING ENDPOINTS========================*/
/* GET all users */
router.get('/getAllUsers', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  // grab all user data
  SQLdatabase.query(GET_ALL_USERS, [], (err, rows) => {
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
  // grab all posts
  SQLdatabase.query(GET_ALL_POSTS, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.json(rows);
  })
})
/*========================END OF DEBUGGING AND TESTING ENDPOINTS========================*/


///////////////////////////////////////    ENDPOINTS    /////////////////////////////////////////////

/* GET home page. */
router.get('/', function(req, res, next) {  
  let SQLdatabase = req.app.locals.SQLdatabase;
  SQLdatabase.query(GET_RECENT_POSTS_BY_AUTHOR, ["Daley", "blogPost"], (err, rows) => {    
    if (err) {
      res.status(500).send(err.message);
      return;
    }   
    res.render('index', { title: "dannydaley", rows: rows, loggedIn: changeNavLoginButton(sessionExists(req)) });  
  })
})

/* GET work SQL page */
router.get('/blog', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;  
  // get all blogPosts by author: "Daley", for portfolio purposes
  SQLdatabase.query(GET_POSTS_BY_AUTHOR, [ "Daley", "blogPost" ], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }  
    res.render('blog', { title: "work", rows: rows, loggedIn: changeNavLoginButton(sessionExists(req)) });
  })
})

/* GET community work SQL page */
router.get('/community-blog', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  // get all posts by all authors according to "blogPost" recipient
  SQLdatabase.query(GET_ALL_POSTS_BY_RECIPIENT, ["blogPost"], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    res.render('blog', { title: "community blog", rows: rows, loggedIn: changeNavLoginButton(sessionExists(req)) });
  })
})

/* GET workJSON page. */
router.get('/blogJson', function(req, res, next) {
  res.render('blogJson', { title: "work.JSON", postDataJSON, loggedIn: changeNavLoginButton(sessionExists(req)) });
});

/* GET workXML page. */
router.get('/blogXml', function(req, res, next) {
  res.render('blogXml', { title: "work.XML",loggedIn: changeNavLoginButton(sessionExists(req)) });
});

/* GET user registration page. */
router.get('/register', function (req, res, next) {
  res.render('register',{ title: "register",loggedIn: changeNavLoginButton(sessionExists(req)) })
})

//adds new user to user database
router.post('/register', function (req, res, next) {
  let { email, username, password1, password2 } = req.body; 
  // if both password fields match..
  if (req.body.password1 === req.body.password2){    
    // generate a password salt 
    let generateSalt = crypto.randomBytes(256).toString('hex');
    // generate the password to store using confirmed password and the newly generated salt
    let storePassword = passwordHash(password2, generateSalt);  
    // initialise database
    let SQLdatabase = req.app.locals.SQLdatabase;
    // rename for easier access..
    let db = SQLdatabase;
    // store the data
    db.query('INSERT INTO `users` (name, email, password, passwordSalt, posts, joined, profilePicture, aboutMe, pinnedPost) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',[username, email, storePassword, generateSalt, 0, getDate(), "images/defaultUser.png", "", 0], function(err, result) {
      // error cases..
      if (err) {
        console.log(err.message);
        if (err.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.name") {
          res.render("registrationError", { cause: "username", loggedIn: changeNavLoginButton(sessionExists(req)) })
        }
        if (err.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email") {
          res.render("registrationError", { cause: "email", loggedIn: changeNavLoginButton(sessionExists(req)) })
        }
        else {
          res.status(500).send(err.message);
          return;
        }  
      }  
      // render on success
       res.render('user-db-done', {  title: "registered", loggedIn: changeNavLoginButton(sessionExists(req)) })     
    })
  }
});

router.get('/changePassword', function (req, res, next) {
  res.render('changePassword', { title: "change password", loggedIn: changeNavLoginButton(sessionExists(req))})
})

//adds new user to user database
router.post('/changePassword', function (req, res, next) {
  let { currentPassword, newPassword1, newPassword2 } = req.body; 
  //get username of logged in user
  let SQLdatabase = req.app.locals.SQLdatabase;
  let username = req.session.userData.sessionUsername;
  let db = SQLdatabase;
  // set up command, select all from user database with THIS email
  const FIND_USER = "SELECT * FROM users WHERE name = ?"   
  // run the command with the email being passed in 
  db.query(FIND_USER, [username], (err, rows) => {  
    if (err) {  
      // if user not found respond with an error      
      found = false;
      res.status(500).send(err);               
    }     
    let user = rows[0]  
    /* if we get a user back, and the stored password matches the output of running the hashing
      function on what the user entered along with the stored password salt, set up the session
      variables and log the user in   */
      //check current password for auth
      if (user !== undefined && user.password === passwordHash(currentPassword, user.passwordSalt)){
        // if both password fields match
        if (req.body.newPassword1 === req.body.newPassword2)  {
          // set up the query
          let query = "UPDATE users SET password = ?, passwordSalt = ? WHERE name = ?"          
          // generate salt to be stored
          let generateSalt = crypto.randomBytes(256).toString('hex');
          // run the query
          db.query(query, [ passwordHash(newPassword2, generateSalt), generateSalt, req.session.userData.sessionUsername ], (err, rows) => {
            // error case
            if (err) {
              console.log(err)
            }
            // render on success
            res.render('user-db-done', {  title: "password changed", loggedIn: changeNavLoginButton(sessionExists(req)) })
          })
        }
        else {          
          console.log("new password and confirmation doesnt match")    
          res.render('changePassword', { title: 'Log in', loggedIn: changeNavLoginButton(sessionExists(req)) });
        }
    } else {          
      console.log("current password doesnt match")    
      res.render('changePassword', { title: 'Log in', loggedIn: changeNavLoginButton(sessionExists(req)) });
    }     
  })
})

/* GET login page. */
router.get('/login', function(req, res, next) {  
  // if req.session.userData.sessionUserIsLoggedIn function returns true, load page with session variables in  play
  if (req.session && req.session.userData && req.session.userData.sessionUserIsLoggedIn) {
    res.render('loggedIn', { name: req.session.userData.sessionUsername, posts: req.session.userData.sessionUserPosts, dateJoined: req.session.userData.sessionUserDateJoined, profilePicture: req.session.userData.sessionUserProfilePicture,title: 'You are logged in!', loggedIn: changeNavLoginButton(sessionExists(req)) });
  }
  else {
    // otherwise render default
    res.render('login', { title: 'Log in', loggedIn: changeNavLoginButton(sessionExists(req)) });
  }
})

/* POST login data to validate login page */
router.post('/login', (req, res, next) => {
  //ready the data
  let data = req.body;
  // init database
  let SQLdatabase = req.app.locals.SQLdatabase;
  // rename for easier access
  let db = SQLdatabase;
  // set up command, select all from user database with THIS email
  const FIND_USER = "SELECT * FROM users WHERE email = ?"  
  // run the command with the email being passed in 
    db.query(FIND_USER, [data.email], (err, rows) => {  
      if (err) {  
        // if user not found respond with an error      
        found = false;
        res.status(500).send(err);               
      }
      let user = rows[0]
      /* if we get a user back, and the stored password matches the output of running the hashing
       function on what the user entered along with the stored password salt, set up the session
       variables and log the user in   */
        if (user !== undefined && user.password === passwordHash(data.password, user.passwordSalt)){
        //create the session data
        req.session.userData = {
        };
        // add user data to the session for referencing across the site 
        req.session.userData.sessionUsername = user.name;         
        req.session.userData.sessionUserPosts = user.posts;
        req.session.userData.sessionUserDateJoined = user.joined;
        req.session.userData.sessionUserProfilePicture = user.profilePicture;
        req.session.userData.sessionUserAboutMe = user.aboutMe;
        req.session.userData.sessionUserIsLoggedIn = true; 
        res.render('loggedIn', { name: req.session.userData.sessionUsername, posts: req.session.userData.sessionUserPosts, dateJoined: req.session.userData.sessionUserDateJoined, profilePicture: req.session.userData.sessionUserProfilePicture, title: 'You are logged in!', loggedIn: changeNavLoginButton(sessionExists(req)) });  
      }
      // otherwise invalid user or pass
      else {
        found = false;      
        res.render('failedLogin', { title: 'Log in', loggedIn: changeNavLoginButton(sessionExists(req)) });
      }       
    })   
})

/*GET logged in page (dashboard) */
router.get('/loggedIn', function(req, res, next) {
  // query the database to get the logged in users profile info
  db.get(GET_USER_PROFILE_INFO, req.session.userData.sessionUsername, (err, rows) => {
    // apply this data to the session variables
    req.session.userData.sessionUserPosts = rows.posts;
    req.session.userData.sessionUserDateJoined = rows.joined;
    req.session.userData.sessionUserProfilePicture = rows.profilePicture;
    req.session.userData.sessionUserAboutMe = rows.aboutMe;
  })
  res.render('loggedIn', { title: 'logged in ', loggedIn: changeNavLoginButton(sessionExists(req)) });
});

/* GET logOut page. */
router.get('/logOut', function(req, res, next) {
  // destroy session data
  req.session = null;
  // ready database for query
  let SQLdatabase = req.app.locals.SQLdatabase;
  // get recent posts ready for display on the index page 
  SQLdatabase.query(GET_RECENT_POSTS_BY_AUTHOR, ["Daley", "blogPost"], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }    
    // render index page after successful logout
    res.render('index', { title: "logged out", rows: rows, loggedIn: changeNavLoginButton(sessionExists(req)) });  
  })
})

/* GET manage blog page */
router.get('/manageBlog', (req, res, next) => {
  // ready database for query
  let SQLdatabase = req.app.locals.SQLdatabase;
  // get all posts authored by the logged in user of the context "blogPost"
  SQLdatabase.query(GET_POSTS_BY_AUTHOR, [req.session.userData.sessionUsername, "blogPost"], (err, rows) => {
    if (err) {
      // error case
      res.status(500).send(err.message);
      return;
    }
    // render manage blog page on success
    res.render('manageBlog', { title: "manage blog", rows: rows,  loggedIn: changeNavLoginButton(sessionExists(req)) });
  })
})
/* GET manage blog page */
router.get('/manageGuestbook', (req, res, next) => {
  // ready database for query
  let SQLdatabase = req.app.locals.SQLdatabase;
  // get all posts authored by the logged in user of the context "blogPost"
  SQLdatabase.query(GET_ALL_POSTS_BY_RECIPIENT, [req.session.userData.sessionUsername], (err, rows) => {
    if (err) {
      // error case
      res.status(500).send(err.message);
      return;
    }
    // render manage blog page on success
    res.render('manageGuestbook', { title: "manage Guestbook", rows: rows,  loggedIn: changeNavLoginButton(sessionExists(req)) });
  })
})

router.post('/pinGuestbookPost',function (req, res, next) {
    // ready the passed in data
    var form = req.body;
    // ready the database for a query
    let SQLdatabase = req.app.locals.SQLdatabase;
  if (form.pin === "pinPost") {
  SQLdatabase.query(SQL_UPDATE_USERS_PINNED_POST, [ form.postId, req.session.userData.sessionUsername ])
}
res.render("blog-db-done", { title: "blog updated", loggedIn: changeNavLoginButton(sessionExists(req)) });
})

/* POST manageblog form */
router.post('/manageBlog', upload.single('change-image'), function (req, res, next) {
  // ready the passed in data
  var form = req.body;
  // ready the database for a query
  let SQLdatabase = req.app.locals.SQLdatabase;  
  // do the validation
  var errors = []; 
  if (!form.title || !form.image || !form.author || !form.content){
    errors.push("Cannot have blank fields");
  }
  if (errors.length){
    // error 400 case
    res.status(400).send(errors);
    return;
  }
  // set the query parameters from the passed in data of the request
  var params = [ form.title, req.body.image,form.link, form.author, form.content, form.id  ];
  // run the update blog command with the given parameters
  SQLdatabase.query(SQL_UPDATE_BLOG, params, function(err, result){
    if (err) {
      res.status(500).send(err.message)
      return;
    }   
    // If pinPost is checked on form, update the users pinned post
    if (form.pin === "pinPost") {
      SQLdatabase.query(SQL_UPDATE_USERS_PINNED_POST, [ form.id, req.session.userData.sessionUsername ])
    }
    // get ready to rewrite the posts json file..
    // gather all existing posts
    SQLdatabase.query(GET_ALL_POSTS, [], (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }    
      // a new blank version of postData JSON ready to re-write the local file
      let postDataJSON3 = {
        "entries": []
      }
      //for each row gathered from the sql query, push it as a JSON object to the empty JSON array
      rows.forEach(row => postDataJSON3.entries.push(
        {
        "id": row.id,
        "author": row.author,
        "title": row.title,
        "image": row.image,
        "content": row.content,
        "link": row.link,
        "date": row.date,
        "recipient": row.recipient
        },))
        // re-write the posts.json file
     fs.writeFileSync('public/posts.json', JSON.stringify(postDataJSON3, null, 2));       
    })    
    res.render("blog-db-done", { title: "blog updated",loggedIn: changeNavLoginButton(sessionExists(req)) });
  })
})

/*GET new post form page */
router.get('/newPost', function(req, res){
  res.render('newPost', { title: 'new post', name: req.session.userData.sessionUsername, loggedIn: changeNavLoginButton(sessionExists(req)) });
});

/* POST new blog post form */
router.post('/newBlogPost', upload.single('image'), function (req, res, next) {
  
  var form = req.body;
  let db = req.app.locals.SQLdatabase;
  if (req.body.image === undefined){
    //defaults the image field is left blank
    req.body.image = "/images/default-post-image.png"
  }
  if (req.body.link === ""){
    //defaults the link to go nowhere
    req.body.link = ""
  } 
  //upload.single(req.image);
  var params = [ form.author, form.title, form.image, form.content, form.link, getDate(), "blogPost"];
  //create the JSON object to add to posts.json
  postDataJSON.entries.unshift({
    id: postDataJSON.entries.length + 1,
    author: req.body.author,
    title: req.body.title,
    image: req.body.image,
    content: req.body.content,
    link: req.body.link,
    date: getDate(),
    recipient: "blogPost"
  })
  // RE-WRITE the posts.json file with the new posts added to the top,
  // JSON.stringify has extra arguments to handle formatting  
  fs.writeFileSync('public/posts.json', JSON.stringify(postDataJSON, null, 2)); 
  req.session.userData.sessionUserPosts++;
  // increment the users post count
  db.query('UPDATE `users` SET `posts` = posts+1 WHERE name = ?',  form.author), function(err, result) {
    if (err){
      console.log(err)
    }
  }
  //Add to SQL database.
  db.query(SQL_ADD_BLOG_POST, params, function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
      res.render("blog-db-done",{ loggedIn: changeNavLoginButton(sessionExists(req)) });
  })
})

/* POST delete blog post form */
router.post('/post-delete', (req, res, next) => {
  // ready the data from the request
  var form = req.body;
  // ready the database for query
  let db= req.app.locals.SQLdatabase;
  // create the deletion target
  var postToDelete = form.deleteThisPost;  
  //reinitialized postDataJSON to make sure weve got an up to date version..
  let postDataJSON2 = require("../public/posts.json");    
  // new entries array to populate
  let newEntries = [];
  //loop through the entries
    for (let i = 0; i < postDataJSON2.entries.length; i++) {
      // search for a match
      if (postDataJSON2.entries[i].id.toString() === form.postId.toString() && postDataJSON2.entries[i].author === form.author) {
          //delete matching entry
          delete postDataJSON2.entries[i];
      } else {
        // push all non-matching posts to the new entries list
      newEntries.push(postDataJSON2.entries[i]);
      }
    }    
    // apply the new entries array to the up to date postDataJSON2.entries
    postDataJSON2.entries = newEntries;    
    //overwrite posts.json with the latest data
    fs.writeFileSync('public/posts.json', JSON.stringify(postDataJSON2, null, 2));
  // decrement the users posts count.
  req.session.userData.sessionUserPosts--;
  db.query('UPDATE `users` SET `posts` = posts-1 WHERE name = ?',  form.author)
  // delete the post
  db.query(BLOG_DELETE_POST, [ postToDelete, form.postId ], function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    // delete the attached image (if it isnt the default)
    if (form.image !== "/images/default-post-image.png") {
          fs.unlink('public' + form.image, (err) => {
      //console.log error if error
    if (err) {
      console.log("error deleting image")
    }});
    }
    res.render('blog-db-done', { "changes": this.changes, loggedIn: changeNavLoginButton(sessionExists(req)) })
   })
})

router.get('/editProfile', (req, res, next) => {
  res.render("editProfile", { name: req.session.userData.sessionUsername, posts: req.session.userData.sessionUserPosts, dateJoined: req.session.userData.sessionUserDateJoined, profilePicture: req.session.userData.sessionUserProfilePicture, aboutMe: req.session.userData.sessionUserAboutMe, loggedIn: changeNavLoginButton(sessionExists(req)) })
})

router.post('/editProfile', upload.single('update-profile-picture'), function (req, res, next) {  
  // ready the data from the request body
  var form = req.body;
  // init the database
  let SQLdatabase = req.app.locals.SQLdatabase;  
  var errors = [];   
  // error case 
  if (errors.length){
    res.status(400).send(errors);
    return;
  }
  // set up the params ready to be passed into the SQL query
  var params = [ req.body.image, form.aboutMe, req.session.userData.sessionUsername ];
  // run the SQL command given the parameters
  SQLdatabase.query(SQL_UPDATE_USER_PROFILE, params, function(err, result){
    if (err) {
      res.status(500).send(err.message)
      return;
    }   
    // re-query the users own profile to serve back to them
    SQLdatabase.query(GET_USER_PROFILE_INFO, req.session.userData.sessionUsername, (err, rows) => {
      let user = rows[0];
      // update session variables     
      req.session.userData.sessionUserProfilePicture = user.profilePicture;
      req.session.userData.sessionUserAboutMe = user.aboutMe;
      req.session.userData.sessionUserPosts = user.posts;
      // render their manage profile page on success
      res.render("editProfile", { name: req.session.userData.sessionUsername, posts: user.posts, dateJoined: user.joined, profilePicture: user.profilePicture, aboutMe: user.aboutMe, loggedIn: changeNavLoginButton(sessionExists(req)) })
    })
  })
})

router.post('/userProfile', (req, res, next) => {
  // ready the database
  let SQLdatabase = req.app.locals.SQLdatabase;
  // get the users profile info according to the name clicked on
  SQLdatabase.query(GET_USER_PROFILE_INFO, [ req.body.username ], (err, userInfo) => {    
    if (err) {
      res.status(500).send(err.message);
      return;
    }  
    //Get users pinned post from user data, check against post id    
    SQLdatabase.query("SELECT * FROM blog WHERE id = ?", [ userInfo[0].pinnedPost ], (err, pinned) => {
      if (err) {        
        res.status(500).send(err.message);
        return;        
      }  
    // get all of that users posts according to username and blogPost 
      SQLdatabase.query(GET_POSTS_BY_AUTHOR, [ req.body.username, "blogPost" ], (err, blogRows) => {
        if (err) {
          res.status(500).send(err.message);
          return;        
        } 
        if (userInfo === undefined){
          res.render("404")
        }
        else {
            res.render("userprofile", { name: req.body.username, posts: userInfo[0].posts, dateJoined: userInfo[0].joined, profilePicture: userInfo[0].profilePicture, aboutMe: userInfo[0].aboutMe, rows: blogRows, pinned: pinned[0], loggedIn: changeNavLoginButton(sessionExists(req)) })  
        }
      })
    })
  })
})

router.post('/getUserSpace', (req, res, next) => {
  // set up database for query
  let SQLdatabase = req.app.locals.SQLdatabase;
  // get users profile info by username
  SQLdatabase.query(GET_USER_PROFILE_INFO, [ req.body.username ], (err, userInfo) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }   
    //Get users pinned post from user data, check against post id    
    SQLdatabase.query("SELECT * FROM blog WHERE id = ?", [ userInfo[0].pinnedPost ], (err, pinned) => {
      if (err) {        
        res.status(500).send(err.message);
        return;
      }
      // get all posts that are addressed to the users profile
      SQLdatabase.query(GET_ALL_POSTS_BY_RECIPIENT, [ req.body.username ], (err, blogRows) => {
        if (err) {
          res.status(500).send(err.message);
          return;        
        } 
        if (userInfo === undefined){
          res.render("404")
        }
        else {
            if (sessionExists(req)) {
              res.render("userSpace", { visitor: req.session.userData.sessionUsername, name: req.body.username, posts: userInfo[0].posts, dateJoined: userInfo[0].joined, profilePicture: userInfo[0].profilePicture, aboutMe: userInfo[0].aboutMe, rows: blogRows,pinned: pinned[0], loggedIn: changeNavLoginButton(sessionExists(req)) }) ;
            } else {
              res.render("userprofile", { name: req.body.username, posts: userInfo[0].posts, dateJoined: userInfo[0].joined, profilePicture: userInfo[0].profilePicture, aboutMe: userInfo[0].aboutMe, rows: blogRows, pinned: pinned[0], loggedIn: changeNavLoginButton(sessionExists(req)) }) 
            }            
        }
      })
    })
  })
})

router.post('/newUserSpacePost', upload.single('image'), function (req, res, next) {
  // get data from the request body
  var form = req.body;
  // rename for quicker access..
  let db = req.app.locals.SQLdatabase;
  // if no image
  if (req.body.image === undefined){
    //defaults the image field is left blank
    req.body.image = "/images/default-post-image.png"
  }
  // if no link..
  if (req.body.link === ""){
    //defaults the link to go nowhere
    req.body.link = ""
  } 
  //upload.single(req.image);
  // set up params for query
  var params = [ form.author, form.title, form.image, form.content, form.link, getDate(), req.body.recipient];
  //create the JSON object to add to posts.json
  postDataJSON.entries.unshift({
    id: postDataJSON.entries.length + 1,
    author: req.body.author,
    title: req.body.title,
    image: req.body.image,
    content: req.body.content,
    link: req.body.link,
    date: getDate(),
    recipient: req.body.username
  })
  // RE-WRITE the posts.json file with the new posts added to the top,
  // JSON.stringify has extra arguments to handle formatting  
  fs.writeFileSync('public/posts.json', JSON.stringify(postDataJSON, null, 2)); 
  req.session.userData.sessionUserPosts++;
  db.query('UPDATE `users` SET `posts` = posts+1 WHERE name = ?',  form.author), function(err, result) {
    if (err){
      console.log(err)
    }
  }
  //Add to SQL database.
  db.query(SQL_ADD_BLOG_POST, params, function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.render("blog-db-done", { loggedIn: changeNavLoginButton(sessionExists(req)) })
  })
})

module.exports = router;