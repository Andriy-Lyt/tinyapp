const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const{findUserIdByEmail, findUserPasswordByEmail, emailExists, 
  generateRandomString, urlsForUser} = require('./helpers.js');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.set("view engine", "ejs");
const bcrypt = require('bcrypt');

//popup
const alert = require('alert');
// alert('Hello');

// Url DB
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "https://www.google.ca", userID: "user2RandomID" }
  };

//Users DB
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "1@1.com", 
    password: "$2b$10$F75Xw5ZSte2FZg.qIUmsseeXPUXmMCNdgbWW1l4jEeGfDbTSW9m1a" //1
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "2@2.com", 
    password: "$2b$10$cQtltHdNj.8buYbYF7wGyur4CrpBzLnAc3B8b1WGIQ5WFv6Elgcpq" //2
  }
}

//home page -----------
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const userObj = users[userId];
  const userURLs = urlsForUser(userId, urlDatabase);  

  const templateVars = { 
    urls: userURLs, 
    user: userObj 
  };
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//upon submitting a form at "urls/new"
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(5);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { 
    "longURL": longURL, 
     "userID": req.session.user_id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to LongURL when clicking on ShortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userId = req.session.user_id;
  const user = users[userId];
  let ermessage = "";

  if (!urlDatabase[shortURL]) { ermessage = "Short URL does not exist"; }
  if (urlDatabase[shortURL]["userID"] != userId) { ermessage = "Short URL does not belong to You"; }

  const templateVars = { 
    "user": user,
    "ermessage": ermessage
  };  

  if (ermessage) {
    res.render("nopage", templateVars);
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : null;
  const userId = req.session.user_id;
  const userObj = users[userId];
  const user = users[userId];
  let ermessage = "";

  if (!urlDatabase[shortURL]) { ermessage = "Short URL does not exist"; }

  if(urlDatabase[shortURL]) {
    if (urlDatabase[shortURL]["userID"] != userId) { ermessage = "Short URL does not belong to You"; }
  }

  const templateVars = { 
    "user": user,
    "ermessage": ermessage,
    shortURL, 
    longURL, 
    user: userObj 
  };

  if (ermessage) {
    res.render("nopage", templateVars);
  } else {
    res.render("urls_show", templateVars);
  }
});

//Edit URL ----------
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const URLobj = urlDatabase[shortURL];
  const userId = req.session.user_id;

  if (URLobj && urlDatabase[shortURL]["userID"] == userId) {
    urlDatabase[shortURL].longURL = longURL;
  }
  const userObj = users[userId];
  const templateVars = { 
    shortURL, 
    longURL, 
    user: userObj 
  };
  res.redirect('/urls');
});

//Delete URL from DB --------
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;

  if (urlDatabase[shortURL]["userID"] == userId) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

//show login form
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { 
    user: user
  };

  res.render("login", templateVars);
});

//process login form --------
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userId;

  //validate data entered into a form
  //entered empty string
  if (!email || !password) {
    alert('Please enter correct Email and Password');
    res.redirect('/login');
  } 
  //user not found
  else if (!findUserIdByEmail(email, users)) {
    res.status(403);
    alert('User not found');
    res.redirect('/login');
  }
  //incorrect password
  else if (!bcrypt.compareSync(password, findUserPasswordByEmail(email, users))) {
    res.status(403);
    alert('incorrect Username or Password');
    res.redirect('/login');
  } 
  //correct email and password, set cookie "user_id"
  else {
    userId = findUserIdByEmail(email, users);
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

//clear a cookie on logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//show Registration form 
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { 
    user: user
  };

  res.render("register", templateVars);
});

//process data from Registration form 
app.post("/register", (req, res) => {
  const randId = generateRandomString(6);

  //check for empty fields in the form
  if (!req.body.email || !req.body.password) {
    res.status(400);
    alert('Please enter both Email and Password.');
  }
  //check if the user with such email exists
  else if (emailExists(req.body.email, users)) {
    res.status(400);
    res.send("Email already registered.");
  }
  else {
    const hashPassw = bcrypt.hashSync(req.body.password, 10); 
    users[randId] = {
      "id": randId,
      "email": req.body.email,
      "password": hashPassw
    }
    req.session.user_id = randId;
      res.redirect('/urls');
  }
});

//non-existent page 
app.get("/*", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { 
    user: user,
    ermessage: "Requested page does not exist"
  };
  res.render("nopage", templateVars);
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});



