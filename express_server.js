const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const PORT = 8080;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  xyz123: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  rtu456: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function (randomLength) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < randomLength; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByEmail = function (email) {
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  return foundUser;
};

const logedInUser = function (req) {
  console.log(req.body);
  if (req.cookies) {
    return req.cookies["user_id"] ? true : false;
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello");
});


///////////////////////////////////////////////////
// Registration routes
///////////////////////////////////////////////////
app.get("/register", (req, res) => { 
  
    res.render("registration");
  
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }

  if (getUserByEmail(email) !== null) {
    return res.status(400).send("Email already exist, please login instead");
  }
  const uniqueId = generateRandomString(6);

  const registeredUser = { id: uniqueId, email: email, password: password };
  users[uniqueId] = registeredUser;
 // res.cookie("user_id", uniqueId);
  res.redirect("/urls");
});

///////////////////////////////////////////////////
// Tiny URL CRUD
///////////////////////////////////////////////////

app.get("/urls.json", (req, res) => {
  res.render("index");
});

app.get("/urls", (req, res) => {
  const userid = req.cookies ? req.cookies["user_id"] : null;
  //const templateVars = { urls: urlDatabase, userID: userid };
  setLocalVariables(userid);
  res.render("urls_index");
});

app.get("/urls/new", (req, res) => {
  //if (!logedInUser(req)) {
    //res.redirect("/login");
  //} else {
    res.render("urls_new");
  //}
});



app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (!logedInUser(req)) {
    return res.status(400).send("Only signed in user can create tiny URL");
  }
  let tinyUrlId = generateRandomString(6);
  urlDatabase[tinyUrlId] = req.body.longURL;
  res.redirect(`/urls/${tinyUrlId}`);
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

///////////////////////////////////////////////////
// Login & Logout routes
///////////////////////////////////////////////////

app.get("/login", (req, res) => {
  // if (logedInUser(req)) {
    // res.redirect("/urls");
  // } else {
    res.render("login");
  // }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email);
  const password = req.body.password;
  if (user === null) {
    return res
      .status(403)
      .send("The email entered does not exist. Please register to use the App");
  }

  if (user.password !== password) {
    return res.status(403).send("The email or password is not correct");
  }

  res.cookie("user_id", user.id);
  setLocalVariables(user.id);
  res.render("urls_index");
});

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  setLocalVariables(null);
  res.render("login");
});
///////////////////////////////////////////////////
// Port listening 
///////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function setLocalVariables(userid) {
    app.locals = { 
      localvariables:{     
      userID: userid, 
      urls: urlDatabase
      }   
    }; 
}




