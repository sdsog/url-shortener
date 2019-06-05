const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrlKey = req.params.shortURL;
  const longUrlValue = urlDatabase[shortUrlKey];
  const templateVars = { shortURL: shortUrlKey , longURL: longUrlValue };
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
  console.log(`this urldatabase ${JSON.stringify(urlDatabase)}`);
  res.send("Ok");        
});

//***** NEW CODE: 
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrlKeyDelete = req.params.shortURL;
  console.log(shortUrlKeyDelete);
  // const actionPost = `/urls/${shortUrlKeyDelete}/delete`; 
  // console.log(actionPost);
  //console.log(shortUrlkey);
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

