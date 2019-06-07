const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// sets request logger
const morgan = require('morgan');
app.use(morgan('dev'));

//sets the view engine
app.set("view engine", "ejs");


// BCCRYPT 
// *******************************************************
const bcrypt = require('bcrypt');


// URL DATABASES
// *******************************************************
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "test" },
  fqeqfe: { longURL: "https://www.test1.com", userID: "test" },
  vrsvrr: { longURL: "https://www.test2.com", userID: "test" },
};

// USER DATABASE
// *******************************************************
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "test2",
    email: "test@test2.com",
    password: bcrypt.hashSync("123", 10),
  },
  "test": {
    id: "test",
    email: "test@test.com",
    password: bcrypt.hashSync("123", 10),
  },
  "1va9Bj": {
    id: '1va9Bj',
    password: bcrypt.hashSync("123", 10),
    email: 'steve@steve.com'
  }
};

// VAR TEMPLATE 
// *******************************************************
const setTemplateVars = (userId) => {

  let templateVars = {};

  if (users[userId]) {

    templateVars = {
      urls: urlDatabase,
      longURL: urlDatabase.longURL,
      email: users[userId].email,
      userId: users[userId].id,
      userURL: urlsForUser(userId),
    };
  } else {
    templateVars = {
      urls: urlDatabase,
      email: null,
    }
  };
  return templateVars;
};

// COOKIE PARSER
// *******************************************************
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'user_id',
  keys: ['user_id']
}));





// BODY PARSER
// *******************************************************
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// JSON
// *******************************************************
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// REGISTRATION PAGE
// *******************************************************
app.get('/register', (req, res) => {
  const templateVars = setTemplateVars(req.session.user_id);
  res.render("urls_register", templateVars);
});

// USER REGISTRATION 
// *******************************************************
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log("this is password, ", password);


  const hashedPassword = bcrypt.hashSync(password, 10);

  console.log("this is hashed password, ", hashedPassword);



  const userId = generateRandomString();

  req.session.user_id = userId;

  for (let key in users) {
    if (users[key].email === email) {
      console.log("matches");
      res.sendStatus(400);
    }
  }



  if (!email) {
    res.sendStatus(400);
    console.log("empty email");
  } else if (!password) {
    res.sendStatus(400);
    console.log("empty password");
  } else {
    users[userId] = {};
    users[userId].id = userId;
    users[userId].password = hashedPassword;
    users[userId].email = email;
    res.redirect(`/urls`);
  }

  console.log("this is users, ", users);

});


// THIS IS LOGIN PAGE
// *******************************************************
app.get('/login', (req, res) => {
  res.render("urls_login");
});


app.post('/login', (req, res) => {

  const email = req.body.email;
  console.log(email);

  const password = req.body.password;

  let pwChecker = false;

  let id;

  for (let key in users) {
    console.log(key);
    console.log(users[key].email);

    if (users[key].email === email) {

      let hashedPassword = users[key].password;
      console.log("this is checker, ", bcrypt.compareSync(password, hashedPassword));
      pwChecker = bcrypt.compareSync(password, hashedPassword);
      id = key;
    }
  }



  // //SUCCESSFUL LOGIN
  if (pwChecker) {
    req.session.user_id = id;
    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }


  //Failed login


});


//INDEX PAGE 
// *******************************************************
// *******************************************************
// *******************************************************
// *******************************************************
// *******************************************************
app.get("/urls", (req, res) => {



  const userId = req.session.user_id;

  console.log("this is userID", userId);

  if (userId) {
    let templateVars = setTemplateVars(userId);
    console.log(templateVars);
    res.render("urls_index", templateVars);

  } else {
    res.redirect("/login");
  }
});

let urlsForUser = (id) => {


  const userURLS = [];

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      const _URLS = {};
      _URLS.shortURL = key;
      console.log("this is id ", id);
      //console.log("this is userURL[key] :" + userURLS[key]);
      _URLS.longURL = urlDatabase[key].longURL;
      _URLS.userID = urlDatabase[key].userID;
      userURLS.push(_URLS);
    }
  }
  return userURLS;
};





//   //console.log(`this is userId: ${userId}`);
//   const templateVars = setTemplateVars (userId);
//   res.render("urls_index", templateVars);
// });

//CREATE NEW TINY URL LINK 
// *******************************************************
app.get("/urls/new", (req, res) => {
  console.log('in /urls/new session looks like:', JSON.stringify(req.session));
  const templateVars = setTemplateVars(req.session.user_id);
  res.render("urls_new", templateVars);
  console.log("I'm firing");
});


//EDIT LINK
// *******************************************************

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  console.log("this is user id" + userId);

  const longURL = req.body.longURL;
  console.log("this is longURL " + longURL);

  const shortURL = generateRandomString();
  console.log("this is shortURL " + shortURL);

  // urlDatabase[shortURL] = longURL;

  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = userId;




  console.log(urlDatabase);

  res.redirect("/urls");
});

//EDIT INDIVIDUAL LINK  
// *******************************************************

app.get("/urls/:shortURL", (req, res) => {

  console.log("EDIT FIRING");

  const shortUrlKey = req.params.shortURL;

  console.log("shortUrlKey :" + shortUrlKey);


  const longUrlValue = urlDatabase[shortUrlKey].longURL;

  console.log("longURLValue :" + longUrlValue);

  const userId = req.session.user_id;


  const templateVars = {
    shortURL: shortUrlKey,
    longURL: longUrlValue,
    email: users[userId].email
  };


  if (userId) {
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
  console.log(urlDatabase);
});


//EDIT URL 
// *******************************************************
// *******************************************************


app.get("/u/:shortURL", (req, res) => {
  const shortUrlKey = req.params.shortURL;


  console.log(`this is shortUrlKey NEW: ${shortUrlKey}`);

  const longURL = urlDatabase[shortUrlKey].longURL; //**************************

  console.log(`this is longURL NEW: ${longURL}`);

  res.redirect(longURL);
});


// EDIT ENTRIES
// *******************************************************
// *******************************************************


app.post('/urls/:shortURL', (req, res) => {

  const shortUrlKey = req.params.shortURL;
  const newName = req.body.newname;

  // if (newName) {
  urlDatabase[shortUrlKey].longURL = newName;
  // }
  //urlDatabase[shortUrlKey] = newName;
  res.redirect(`/urls/${shortUrlKey}`);

});



// LOGS OUT USER AND CLEARS COOKIES 
// *******************************************************
// *******************************************************

app.post('/logout', (req, res) => {
  console.log('Im firing');
  res.clearCookie("user_id");
  res.clearCookie("user_id.sig");
  res.redirect("/login");
});



// DELETE TINYURL ENTRY FROM DATABASE
// *******************************************************
// *******************************************************

app.post("/urls/:shortURL/delete", (req, res) => {

  const userId = req.session.user_id;

  if (userId) {
    const shortUrlKeyDelete = req.params.shortURL;
    console.log("this is short url key: ", shortUrlKeyDelete);
    delete urlDatabase[shortUrlKeyDelete];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }

});

// GENERATES RANDOM STRING FOR USER ID
// *******************************************************
let generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let length = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * length));
  }
  return result;
};