const { json } = require('express');

let express = require('express');

let { MethodNotAllowed } = require('http-errors');

let router = express.Router();

/* DATE HANDLING */

let generateDate = () => { 
  let day = new Date().getDay()
  let month = new Date().getMonth();
  let year = new Date().getFullYear();
  let dateString = "" + day + "-" + month + "-" + year + ""; 
  return dateString;
}


const dateFormatSwitcher = (oldDate) => {
  let day = oldDate.slice(8, 10)
  let year = oldDate.slice(0, 4)
  let month = oldDate.slice(5, 7)
  let newYear = "" + day + "-" + month + "-" + year + ""
  return newYear;
}

/* END OF DATE HANDLING */



/* IMAGE UPLOAD HANDLING */

var multer  = require('multer');

//set up storage location
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads')
  }, //set up filename
  filename: function (req, file, cb) {
    if (file.fieldname !== undefined) {
      // delete the attached image
      fs.unlink('public' + req.body.image, (err) => {
      //console.log error if error
      if (err) {
        console.log("error deleting image")
      }  
    });
    //create unique suffix for naming
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // create filename (author + filename + unique suffix + filetype)
    cb(null, req.body.author + '-' + file.fieldname + '-' + uniqueSuffix + '.png')
    // reset the request.body.image field with the image location + new filename to be put in the database as a link
    req.body.image = "/images/uploads/" + req.body.author + '-' + file.fieldname + '-' + uniqueSuffix + '.png'
    }
    // if upload image field on form is left blank..
    else {
      return
    }
  }
})

const upload = multer({ storage: storage });

/* END OF IMAGE UPLOAD HANDLING */

let postDataJSON = require("../public/posts.json");

// fs is needed for writing/deleting files
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
const SQL_UPDATE_BLOG =  "UPDATE `blog` SET title = ?, image = ?, link = ?, author = ?, content = ? WHERE id = ?" //SQL command
const GET_ALL_USERS = "SELECT * FROM users"; // SQL command

/* Database setup endpoint */
router.get('/SQLDatabaseUserSetup', (req, res, next) => {
  let SQLdatabase = req.app.locals.SQLdatabase;
  //these queries must run one by one - dont try and delete and create tables at the same time.
  SQLdatabase.serialize( () => {
    //delete the table if it exists..
    SQLdatabase.run('DROP TABLE IF EXISTS `users`');
    SQLdatabase.run('CREATE TABLE `users` (id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(255) UNIQUE, email varchar(255) UNIQUE, password varchar(255), passwordSalt varchar(512), posts int, joined varchar(255))');
    //create test rows
    let rows = [
      ['Danny', 'dannydaley@outlook.com', '493509dac1a23de8901b9564acea549d6d9d3ae960062978d90feef9bd77f2b4399a61bc396389119fbb7069f2dac7520497dc8ac733a98b4a734af8e4cf4883','8dc317df7da5cbc21859fe9e3fa07cb9cc81bbd1d58da2747d4282c4d9abbf2f372a8c73f68b7ef323a08b98da1401d8b639b1310f8094c7a1950e4a85300f70f7a92536b4b1a860bf759128ac9632b807100f48af7f906fbf14d27f4a16293eccb024f5182db76f356a3644a4c542ff35a17bd3a7b19a757a2fa318fbd3a45e62129a10fa481503233e9a998518b91430244157e328e7129c84a0d478e7d3c2360f0357d5b1a64d0d70de494436dcb84798bf8b629ee2089683e1b5d4faca23b1c5c43d031928684be00ce96b42a73269ddadf688c6737458642b5100d9db29be6594f327f4b44234786ecd407b2c98e52d766439e7742ac937ca58811b284c', 0, generateDate()],
      ['Danny2', 'dandaley@email.com', 'bedb5e0ea27c1bcdba8eab671909819673eb0c87bd9c47f61a4163b74f494bfd1f4c4dfef209df4f30f8baa7fd3867f92d706b4dc8b6ee699b021615e0a6e7e7','4aae2963b54bdf7aa63fa8a3a8af791ddbd3ee1f8a5f7169ee4cb2c107ddadc3b84310e9761e3bbac1572c7d264026200dcdb6c97e0b24bbe18542bc51a062e6be3deeb39b9a99ec964cba5cfcd340bf4b719d7cbc3ea8dc3c317592ed391771b279427d04c296c5be94c25ac828e6fa5906ac8b820d7611d85c836ac1ee4acd26496e4665bfa711361a13165bbecdb79afc47b70b46e9d05487ac01ad87249042e8d916b59e4231231550bca5e1f0e3b2ffad1d33edbbf10f69a350f6753c9b37665e468a5bfc275ba834474197a91c1dc2b9e1cfc4d4746e912bfd4cf404f9d34b560e3c23fdc56a0d78d3cadbf49b3c727c0fca7ac1a9eb6c7cd2d63a41da', 0, generateDate()],
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
    //create base rows
    let rows = [];
    //loop through posts.json to populate rows array
    for (let i = 0; i < postDataJSON.entries.length; i++) {
      rows[i] = [postDataJSON.entries[i].id, postDataJSON.entries[i].author, postDataJSON.entries[i].title, postDataJSON.entries[i].image, postDataJSON.entries[i].content, postDataJSON.entries[i].link, postDataJSON.entries[i].date]
    }
    // populate SQL command with rows array populated from posts.json
    rows.forEach( (row) => {
      console.log(row.author)
      let posts = 1
      SQLdatabase.run('INSERT INTO `blog` VALUES(?,?,?,?,?,?,?)', row);
      SQLdatabase.run('UPDATE `users` SET `posts` = posts+1 WHERE name = ?',  row[1])
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
    db.run('INSERT INTO `users` (name, email, password, passwordSalt, posts, joined) VALUES(?, ?, ?, ?, ?, ?)',[username, email, storePassword, generateSalt, 0, new Date().getDay() + "," + new Date().getMonth() + "," +  new Date().getFullYear()], function(err, result) {
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

router.post('/manageBlog', upload.single('change-image'), function (req, res, next) {
  var form = req.body;
  let SQLdatabase = req.app.locals.SQLdatabase;
  // do the validation
  var errors = [];  
  console.log(form)
    if (!form.title || !form.image || !form.link || !form.author || !form.content){
      errors.push("Cannot have blank fields");
    }
    if (errors.length){
      res.status(400).send(errors);
      return;
    }
  
  var params = [ form.title, req.body.image,form.link, form.author, form.content, form.id  ];console.log(params)
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

router.post('/newBlogPost', upload.single('image'), function (req, res, next) {
  var form = req.body;
  let db = req.app.locals.SQLdatabase; 
  console.log(req.body.image) 
  if (req.body.image === undefined){
    //defaults the image field is left blank
    req.body.image = "/images/d2.png"
  }
  if (req.body.link === ""){
    //defaults the link to go nowhere
    req.body.link = "#"
  } 
  //upload.single(req.image);
  var params = [ form.author, form.title, form.image, form.content, form.link, generateDate()];

  //create the JSON object to add to posts.json
  postDataJSON.entries.unshift({
    id: postDataJSON.entries.length + 1,
    author: req.body.author,
    title: req.body.title,
    image: req.body.image,
    content: req.body.content,
    link: req.body.link,
    date: generateDate()
  })

  // RE-WRITE the posts.json file with the new posts added to the top,
  // JSON.stringify has extra arguments to handle formatting  
  fs.writeFileSync('public/posts.json', JSON.stringify(postDataJSON, null, 2)); 
  db.run('UPDATE `users` SET `posts` = posts+1 WHERE name = ?',  form.author)
  //Add to SQL database.
  db.run(SQL_ADD_BLOG_POST, params, function(err, result) {
    console.log(form)
    if (err) {
      res.status(500).send(err.message);
      return;
    }
      res.render("blog-db-done",{ loggedIn: changeNavLoginButton(isLoggedIn) });
  })
})

const BLOG_DELETE_POST = "DELETE FROM `blog` WHERE title = ? AND id = ?";
router.post('/post-delete', (req, res, next) => {
  var form = req.body;
  let db= req.app.locals.SQLdatabase;
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
  db.run('UPDATE `users` SET `posts` = posts-1 WHERE name = ?',  form.author)
  // delete the post
  db.run(BLOG_DELETE_POST, [ postToDelete, form.postId ], function(err, result) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    // delete the attached image
    fs.unlink('public' + form.image, (err) => {
      //console.log error if error
    if (err) {
      console.log("error deleting image")
    }  
  });
     res.render('blog-db-done', { "changes": this.changes, loggedIn: changeNavLoginButton(isLoggedIn) })
   })
})

module.exports = router;