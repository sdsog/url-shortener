const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// sets request logger
const morgan = require('morgan');
app.use(morgan('dev'));

// Sets View Engine: EJS
// *******************************************************
app.set("view engine", "ejs");

// Encrypting Passwords
// *******************************************************
const bcrypt = require('bcrypt');


// Url Database
// *******************************************************
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "test" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "test" },
  fqeqfe: { longURL: "https://www.amazon.com", userID: "test" },
  vrsvrr: { longURL: "https://www.reddit.com", userID: "test" },
};

// User Database
// *******************************************************
const users = {
  "test": {
    id: "test",
    email: "test@test.com",
    password: bcrypt.hashSync("123", 10),
  }
};


// Cookie Parser to encrypt cookies
// *******************************************************
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'user_id',
  keys: ['user_id']
}));


// Body paser
// *******************************************************
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// JSON
// *******************************************************
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



// GLOBAL FUNCTIONS
// ********************************************************************
// ********************************************************************

// calls user data based off user_id cookie to populate user variables 
// ********************************************************************
const retrieveUserData = (userId) => {
  let templateVars = {};
  if (users[userId]) {
    templateVars = {
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

// cb for populating "/index" with URLs that user has created
// ********************************************************************
const urlsForUser = (id) => {
  const userURLS = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      const _URLS = {};
      _URLS.shortURL = key;
      _URLS.longURL = urlDatabase[key].longURL;
      _URLS.userID = urlDatabase[key].userID;
      userURLS.push(_URLS);
    }
  }
  return userURLS;
};

// Generates random string for userID + TinyURL
// ********************************************************************
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let length = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * length));
  }
  return result;
};


// REGISTRATION PAGE
// ********************************************************************
// ********************************************************************

app.get('/register', (req, res) => {
  const templateVars = retrieveUserData(req.session.user_id);
  res.render("urls_register", templateVars);
});

// Creates new user via registration page
// *******************************************************


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  req.session.user_id = userId;

  for (let key in users) {
    if (users[key].email === email) {
      res.status(400).send("Email already exists.");
    }
  }

  //Checks for empty fields and returns error message
  if (!email) {
    res.status(400).send("Must enter email.");
  } else if (!password) {
    res.status(400).send("Password empty.");
    //Creates new entry in user database object
  } else {
    users[userId] = {};
    users[userId].id = userId;
    users[userId].password = hashedPassword;
    users[userId].email = email;
    res.redirect(`/urls`);
  }
});


// THIS IS LOGIN PAGE
// ********************************************************************
// ********************************************************************

app.get('/login', (req, res) => {
  res.render("urls_login");
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let pwChecker = false;
  let id;
  for (let key in users) {
    if (users[key].email === email) {
      let hashedPassword = users[key].password;
      pwChecker = bcrypt.compareSync(password, hashedPassword);
      id = key;
    }
  }
  // Successful login after validation 
  if (pwChecker) {
    req.session.user_id = id;
    res.redirect("/urls");
  } else {
    //res.sendStatus(400, { error: "some elaborate error message" });
    res.status(400).send("Login failed. Please try again.");
  }
});


//INDEX PAGE - HOMEPAGE (REQUIRES LOGIN)
// ********************************************************************
// ********************************************************************

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    let templateVars = retrieveUserData(userId);
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});


// CREATE NEW TINY URL PAGE
// ********************************************************************
// ********************************************************************

app.get("/urls/new", (req, res) => {
  const templateVars = retrieveUserData(req.session.user_id);
  res.render("urls_new", templateVars);
});


// ADD NEW URL TO URL DATABASE
// ********************************************************************
// ********************************************************************

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = userId;
  res.redirect("/urls");
});

// SHOWS SPECIFIC LINK 
// ********************************************************************
// ********************************************************************

app.get("/urls/:shortURL", (req, res) => {
  const shortUrlKey = req.params.shortURL;
  const longUrlValue = urlDatabase[shortUrlKey].longURL;
  const userId = req.session.user_id;
  const templateVars = {
    shortURL: shortUrlKey,
    longURL: longUrlValue,
    email: users[userId].email
  };

  //checks to see if user is logged in
  if (userId) {
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});


//EDIT URL PAGE
// ********************************************************************
// ********************************************************************


app.get("/u/:shortURL", (req, res) => {
  const shortUrlKey = req.params.shortURL;
  const longURL = urlDatabase[shortUrlKey].longURL;
  res.redirect(longURL);
});


// EDIT EXISTING LINK
// ********************************************************************
// ********************************************************************


app.post('/urls/:shortURL', (req, res) => {
  const shortUrlKey = req.params.shortURL;
  const newName = req.body.newname;
  urlDatabase[shortUrlKey].longURL = newName;
  res.redirect(`/urls/${shortUrlKey}`);
});


// LOGS OUT USER AND CLEARS COOKIES 
// ********************************************************************
// ********************************************************************

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.clearCookie("user_id.sig");
  res.redirect("/login");
});



// DELETE TINYURL ENTRY FROM DATABASE
// ********************************************************************
// ********************************************************************

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const shortUrlKeyDelete = req.params.shortURL;
    delete urlDatabase[shortUrlKeyDelete];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// REDIRECTS ALL REQUESTS TO INDEX
// ********************************************************************
// ********************************************************************

app.get("*", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
