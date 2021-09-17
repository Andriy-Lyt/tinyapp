const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
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
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "2@2.com", 
    password: "2"
  }
}

//Helper functions --------
//find user_id by email in database
const findUserIdByEmail = (email) => {
  for(let key in users) {
    if (users[key]["email"] === email) {
      return users[key]["id"];
    }
  }
}

//find user password by email in database
const findUserPasswordByEmail = (email) => {
  for(let key in users) {
    if (users[key]["email"] === email) {
      return users[key]["password"];
    }
  }
}

//check if the user with provided email exists in database
function emailExists(email) {
  for(let key in users) {
    if (key["email"] === email) {
      return true;
    }
  }
  return false;
}
//generate random string
function generateRandomString(num) {
  return Math.random().toString(36).substring(2, num+2);
 } 
 //  console.log(generateRandomString());

 //find URLs that belong to the particular User
 function urlsForUser(id) {
   userURLs = {};
   for(let key in urlDatabase) {
     if (urlDatabase[key].userID == id) {
      userURLs[key] = urlDatabase[key].longURL;
     }
   }
   return userURLs;
 }

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//home page --------
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const userObj = users[userId];
  const userURLs = urlsForUser(userId);

  const templateVars = { 
    urls: userURLs, 
    user: userObj 
  };
  if (userId) {
    console.log("password: "+ users[userId].password);
  }
  
  // console.log(req.cookies);
  // console.log("templateVars.user: "+templateVars.user);
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//upon submitting a form at "urls/new"
app.post("/urls", (req, res) => {
  // console.log('req.body from POST:', req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString(5);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { 
    "longURL": longURL, 
     "userID": req.cookies["user_id"]
  };
  
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to LongURL when clicking on ShortURL
app.get("/u/:shortURL", (req, res) => {
  // console.log('req.body from get /u/:shortURL:',req.body);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log("longURL: "+longURL);
  
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { 
    user: user
  };
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
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
  // const longURL = req.body.longURL;
  const longURL = urlDatabase[shortURL].longURL;
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

//Edit URL ----------
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const URLobj = urlDatabase[shortURL];
  const userId = req.cookies["user_id"];

  if (URLobj && urlDatabase[shortURL]["userID"] == userId) {
    urlDatabase[shortURL].longURL = longURL;
  }
  const userObj = users[userId];
  const templateVars = { 
    shortURL, 
    longURL, 
    user: userObj 
  };
  res.render("urls_show", templateVars);
});

//Delete URL from DB --------
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies["user_id"];

  if (urlDatabase[shortURL]["userID"] == userId) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

//show login form
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
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
  else if (!findUserIdByEmail(email)) {
    res.status(403);
    alert('User not found');
    res.redirect('/login');
  }
  //incorrect password
  else if (!bcrypt.compareSync(password, findUserPasswordByEmail(email))) {
    res.status(403);
    alert('incorrect Username or Password');
    res.redirect('/login');
  } 
  //correct email and password, set cookie "user_id"
  else {
    userId = findUserIdByEmail(email);
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
});

//clear a cookie on logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//show Registration form 
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
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
  //check if user with such email exists
  else if (emailExists(req.body.email)) {
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
    res.cookie("user_id", randId);
      console.log("new user: "+users[randId].email);
      console.log('cookie:'+req.cookies["user_id"]);  
      res.redirect('/urls');
  }
});
