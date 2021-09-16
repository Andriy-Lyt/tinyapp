const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
}

function emailExists(email) {
  for(let key in users) {
    if (key["email"] === email) {
      return true;
    }
  }
  return false;
}

function generateRandomString(num) {
  return Math.random().toString(36).substring(2, num+2);
 } 
//  console.log(generateRandomString());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//home page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//upon submitting a form at "urls/new"
app.post("/urls", (req, res) => {
  // console.log('req.body from POST:', req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString(5);
  const longURL = req.body.longURL;
  //short URL is object key name; long url is the value of this key;
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to LongURL when clicking on ShortURL
app.get("/u/:shortURL", (req, res) => {
  // console.log('req.body from get /u/:shortURL:',req.body);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

 app.get("/urls", (req, res) => {
  // const cookie = req.cookies["username"];
  const userId = req.cookies["user_id"];
  const userObj = users[userId];
  const templateVars = { 
    urls: urlDatabase, 
    user: userObj 
  };
  // console.log(req.cookies);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const longURL = req.body.longURL;
  const longURL = urlDatabase[shortURL];
  // if (URLobj) {
  //   urlDatabase[shortURL] = longURL;
  // }
  const userId = req.cookies["user_id"];
  const userObj = users[userId];
  const templateVars = { 
    shortURL, 
    longURL, 
    user: userObj 
  };

  // const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const URLobj = urlDatabase[shortURL];
  if (URLobj) {
    urlDatabase[shortURL] = longURL;
  }

  const userId = req.cookies["user_id"];
  const userObj = users[userId];
  const templateVars = { 
    shortURL, 
    longURL, 
    user: userObj 
  };
  res.render("urls_show", templateVars);
});


//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//show login form
app.get("/login", (req, res) => {
  res.render("login");
});

//set a cookie
app.post("/login", (req, res) => {
  //set a cookie
  // console.log('usernameLogin: '+ req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//clear a cookie
app.post("/logout", (req, res) => {
  console.log('usernameLogin: '+ req.body.username);
  res.clearCookie('username');
  res.redirect('/urls');
});

//show Registration form 
app.get("/register", (req, res) => {
  res.render("register");
});

//get data from Registration form 
app.post("/register", (req, res) => {
  const randId = generateRandomString(6);

  //check for empty fields in the form
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send("Please enter both Email and Password.");
  }
  //check if user with such email exists
  if (emailExists(req.body.email)) {
    res.status(400);
    res.send("Email already registered.");
  }
  
  users[randId] = {
    "id": randId,
    "email": req.body.email,
    "password": req.body.password
  }
  res.cookie("user_id", randId);
    console.log("new user: "+users[randId].email);
    console.log('cookie:'+req.cookies["user_id"]);  
    res.redirect('/urls');
});



//Test ---------------
/* app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 */

