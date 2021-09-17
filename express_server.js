const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");

//popup
const alert = require('alert');
// alert('Hello');

// Url DB
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    email: "user2@example.com", 
    password: "dishwasher-funk"
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
  const templateVars = { 
    urls: urlDatabase, 
    user: userObj 
  };
  // console.log(req.cookies);
  console.log("templateVars.user: "+templateVars.user);
  
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
  //short URL is object key name; long url is the value of this key;
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to LongURL when clicking on ShortURL
app.get("/u/:shortURL", (req, res) => {
  // console.log('req.body from get /u/:shortURL:',req.body);
  const longURL = urlDatabase[req.params.shortURL];
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
  const templateVars = { 
    user: user
  };

  res.render("urls_new", templateVars);
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
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { 
    user: user
  };

  res.render("login", templateVars);
});

//process login form
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
  else if(!findUserIdByEmail(email)) {
    res.status(403);
    alert('User not found');
    res.redirect('/login');
  }
  //incorrect password
  else if(password !== findUserPasswordByEmail(email)) {
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
    users[randId] = {
      "id": randId,
      "email": req.body.email,
      "password": req.body.password
    }
    res.cookie("user_id", randId);
      console.log("new user: "+users[randId].email);
      console.log('cookie:'+req.cookies["user_id"]);  
      res.redirect('/urls');
  }
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

