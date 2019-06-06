const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// sets request logger
const morgan = require('morgan');
app.use(morgan('dev'));

//sets the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
   "test": {
    id: "test", 
    email: "test@test.com", 
    password: "123"
  }
};



const setTemplateVars = (userId) => {
	let templateVars ={};
  if (users[userId]) {
  	console.log("here");
  	templateVars = {
  		urls: urlDatabase,
   	 	email: users[userId].email,

    };
  }else{ 
  	templateVars = {
  	  urls: urlDatabase,
   	  email: null,
   	}
  };
 return templateVars;
};

//sets cookie parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());

//sets body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//registration page
app.get('/register', (req, res) => {

  const templateVars = setTemplateVars (req.cookies.user_id);

  res.render("urls_register", templateVars);
});


//registration page - add user to registration database
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
  res.cookie("user_id", userId);
  


  
  if (!email) {
  	res.sendStatus(400);
  	console.log("empty email");
  } else if (!password) {
  	res.sendStatus(400);
  	console.log("empty password");
  } else {
	users[userId] = {};
  	users[userId].id = userId;
  	users[userId].password = password;
  	users[userId].email = email;
  	res.redirect(`/urls`);
  }

  //console.log(users);

  
});


//THIS IS LOGIN PAGE
// *******************************************************
app.get('/login', (req, res) => {
  
  res.render("urls_login");
});


//login page - allows users to login
app.post('/login', (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  console.log("this is email: ", email);
  console.log("this is password: ", password);

  //testing-purposes
  

  for (let key in users) {
	if (users[key].email === email) {
		console.log("matches");
		res.cookie("user_id", users[key].id);
	} else {
		console.log("email bad");
  }
 }


 res.render("urls_login");

  
});





app.get('/', (req, res) => {
	res.redirect("urls_index");
});



app.get("/urls", (req, res) => {
  
  const userId = req.cookies.user_id;
  // const userId = req.cookies[user_id];
  //console.log(`this is user_id: ${user_id}`);
  console.log(`this is userId: ${userId}`);



  //const userEmail = users.userId.email;

  // const user = {}
  // user = user.userId

  //const email = users[userId].email;

  // console.log(`this is pw:`, email);


  // const userIdEmail = users[userId].email;
  // const userId = req.cookies[user_id];
  //console.log(`this is user_id: ${user_id}`);
  // console.log(`this is usersIdEmail:`, userIdEmail);


  const templateVars = setTemplateVars (userId);


 
  res.render("urls_index", templateVars);
});

//create new tinyURL
app.get("/urls/new", (req, res) => {
  const email = users[userId].email;


  const templateVars = setTemplateVars (req.cookies.user_id);

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrlKey = req.params.shortURL;
  const longUrlValue = urlDatabase[shortUrlKey];
  const templateVars = {
  	shortURL: shortUrlKey,
  	longURL: longUrlValue,
  	username: req.cookies["username"],
 };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortUrlKey = req.params.shortURL;
  const longURL = urlDatabase[shortUrlKey];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  //console.log(req.body);
  const longURL = req.body.longURL;
  //generates random string 
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  //console.log(`this urldatabase ${JSON.stringify(urlDatabase)}`);
  res.redirect("/urls");       
});

//ADD USER NAME
// app.post('/login', (req, res) => {
//   const username = req.body.username;
//   // console.log(`this is userName ${username}`);
//   res.cookie("username", username);
//   // console.log(`this is userCookie ${userCookie}`);
//   // console.log(`this is userCookie ${userCookie}`);
//   res.redirect("/urls"); 
// });


//LOGOUT
app.post('/logout', (req, res) => {
  console.log('Im firing');
  res.clearCookie("user_id");
  res.redirect("/urls"); 
});



// EDIT ENTRY
app.post('/urls/:shortURL', (req, res) => {
    const shortUrlKey = req.params.shortURL;
    //console.log(`this is short url key: ${shortUrlKey}`);
    const newName = req.body.newname;
    console.log(`this is body.newname ` + req.body.newname);
    console.log(`this is newname: ${newName}`);
    // if (newName) {
        urlDatabase[shortUrlKey] = newName;
    // }
    //urlDatabase[shortUrlKey] = newName;
    res.redirect(`/urls/${shortUrlKey}`);
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrlKeyDelete = req.params.shortURL;
  //console.log(shortUrlKeyDelete);
  delete urlDatabase[shortUrlKeyDelete];
  res.redirect("/urls");
});

//Generates random string 
let generateRandomString = () => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let length = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * length));
  }
  return result;
};


// // Catch-all redirect
// app.get('*', (request, response) => {
// 	response.redirect("urls_index");
// });
