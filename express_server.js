const express = require("express");
const cookiesparser = require("cookie-parser");
const bcencrypt = require('bcryptjs');
const app = express();
//const bodyParser = require('body-parser');
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookiesparser());
//app.use(bodyParser.urlencoded({extended: false}));
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

const getUserByEmail = function(email) {
  return (Object.values(users).includes(email))? users : null;
}

app.get("/", (req,res) =>{
  res.send("Hello");
})
app.get("/urls.json", (req, res) => {
  res.render("index");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  app.locals = {
    users
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/register", (req, res) => {
  console.log("i came here");
  res.render("registration");
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

app.post("/register",(req,res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }

  if(getUserByEmail(email) !== null) {
    return res.status(400).send("Email already exist, please login instead");
  }
  const uniqueId = generateRandomString(6);
  
  const registeredUser = {id: uniqueId, email: email, password: email };
   users[uniqueId] = registeredUser;
   res.cookie("user_id",uniqueId);
   res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let tinyUrlId = generateRandomString(6);
  urlDatabase[tinyUrlId] = req.body.longURL;
  res.redirect(`/urls/${tinyUrlId}`);
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/login", (req,res) => {
  res.render("login");
})

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
