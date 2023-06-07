const express = require("express");
const { url } = require("inspector");
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const PORT = 8080;

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "emmanuelbalogun64@gmail.com",
  },
};

const users = {
  xyz123: {
    id: "xyz123",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  rtu456: {
    id: "rtu456",
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

const logedInUser = function () {
  return app.locals.localvariables.userID;
};

app.get("/", (req, res) => {
  res.send("Hello");
});

///////////////////////////////////////////////////
// Registration routes
///////////////////////////////////////////////////
app.get("/register", (req, res) => {
  if (logedInUser()) {
    res.render("urls_index");
  } else {
    res.render("registration");
  }
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
  
  if(app.locals.localvariables === undefined) {setLocalVariables(null)};
  
  if (logedInUser()) {
    res.render("urls_index");
  } else {
    
    res
      .status(400)
      .send(
        `<h1>Kindly <a href="/login">log in</a> or <a href="/register">Register</a>to have access to this page</h1>`
      );
  }
});

app.get("/urls/new", (req, res) => {
  if (!logedInUser()) {
    res.render("login");
  } else {
    res.render("urls_new");
  }
});

app.get("/urls/:id", (req, res) => {
  const userid = logedInUser();
  const id = req.params.id;
  console.log(specificurlsForUser(userid,id));
  const templateVars = {
    id: id,
    longURL:  specificurlsForUser(userid,id).longURL
  };
   
  if(!templateVars.longURL){
    return res.status(400).send("You were trying to view non existing URLS");
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const userid = logedInUser();
  if(userid) {
  const longURL = specificurlsForUser(userid,req.params.id).longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(400).send("The URL specified does not exist");
  }
}
});

app.post("/urls/:id/delete", (req, res) => {
  const userid = logedInUser();
  if(userid) {
  delete urlsForUser(userid)[req.params.id];
  res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  let userid = logedInUser();
  if (!userid) {
    return res.status(400).send("Only signed in user can create tiny URL");
  }
  let tinyUrlId = generateRandomString(6);
  urlDatabase[tinyUrlId] = {longURL: req.body.longURL, userID: userid };
  setLocalVariables(userid);
  res.redirect(`/urls/${tinyUrlId}`);
});

app.post("/urls/:id/update", (req, res) => {
  const userid = logedInUser();
  if(userid) { 
    if(specificurlsForUser(userid,req.params.id)){
      urlDatabase[req.params.id].longURL = req.body.longURL;
    }
    res.redirect("/urls");
  }
});

///////////////////////////////////////////////////
// Login & Logout routes
///////////////////////////////////////////////////

app.get("/login", (req, res) => {
  if (logedInUser()) {
    res.render("urls_index");
  } else {
    res.render("login");
  }
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
  let email = userid ? users[userid].email: "";
  const result = urlsForUser(userid);
  let url = {};
if(result) {
  for (const [key, value] of Object.entries(result)) {
    if(key ==="longURL"){
      url["longURL"]= value;
    }
  }
}
  app.locals = {
    localvariables: {
      userID: userid,
      id: userid,
      urls: url,
    },
  };
}

const urlsForUser = function (id) {
  const asArray = Object.entries(urlDatabase);
  const filtered = asArray.filter(([key, value]) => value.userID === id);
  const obj = Object.fromEntries(filtered);
  
  for (let key in obj) {
    if (typeof obj[key] === "object") {
      for (let nestedKey in obj[key]) {
        return  obj[key];
      }
    }   
}};


const specificurlsForUser = function (userid,id) {
  const asArray = Object.entries(urlDatabase);
  const filtered = asArray.filter(([key, value]) => value.userID === userid);
  
  const obj = Object.fromEntries(filtered);  
    
    return obj[`${id}`];
};


