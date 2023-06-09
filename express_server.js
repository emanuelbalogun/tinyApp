const express = require("express");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  getUserEmail,
} = require("./helpers");
const { urlDatabase, users } = require("./database.js");
let cookieSession = require("cookie-session");
const saltRounds = 10;
const app = express();
const PORT = 8080;

app.use(
  cookieSession({
    name: "session",
    keys: ["Ilove20$", "Ihate30$", "Ilike40$"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const user_id = req.session.user_id;

  if(!user_id) {
    return res.redirect("\login");
  }

  res.redirect("/urls");
});

///////////////////////////////////////////////////
// Registration routes
///////////////////////////////////////////////////
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const email = users[user_id] ? users[user_id].email : "";
  const templateVars = {
    user_id,
    email,
  };
  
  if (user_id) {
    res.render("urls_index");
  } else {
    res.render("registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }

  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send("Email already exist, please login instead");
  }

  const uniqueId = generateRandomString(6);
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  const registeredUser = { id: uniqueId, email: email, password: hash };

  users[uniqueId] = registeredUser;
  req.session.user_id = uniqueId;
  res.redirect("/urls");
});

///////////////////////////////////////////////////
// Tiny APP URL CRUD ROUTES
///////////////////////////////////////////////////

app.get("/urls.json", (req, res) => {
  res.render("index");
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res
      .status(400)
      .send(
        `<h1>Kindly <a href="/login">log in</a> or <a href="/register">Register</a>to have access to this page</h1>`
      );
  }

  const urls = urlsForUser(urlDatabase, user_id);
  const email = user_id ? getUserEmail(user_id, users) : "";
  const templateVars = {
    urls,
    user_id,
    email,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect("login");
  }

  const email = getUserEmail(user_id, users);
  res.render("urls_new", { user_id, email });
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const id = req.params.id;

  if (!user_id) {
    return res.status(400).send('Kindly  <a href="/login">log in</a>  to view the URL requested');
  }

  const urls =urlsForUser(urlDatabase, user_id);
  const templateVars = {
    id,
    user_id,
    urls,
    email: getUserEmail(user_id, users),
  };

  if (!urls) {
    return res.status(400).send("You were trying to view non existing URLS");
  }else if (!urls[id]) {
    return res.status(400).send("You can only view owned URLS");
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    return res
      .status(400)
      .send("The URL specified does not exist or does not belong to you");
  }

  res.redirect(url.longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  const id = req.params.id;

  if (!user_id) {
    return res
      .status(400)
      .send("You need to log in before you can delete a URL");
  }

  const url = urlsForUser(urlDatabase, user_id);

  if (!url[id]) {
    return res.status(400).send("You can only delete owned URL");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let user_id = req.session.user_id;

  if (!user_id) {
    return res.status(400).send("Only signed in user can create tiny URL");
  }

  let tinyUrlId = generateRandomString(6);
  urlDatabase[tinyUrlId] = { longURL: req.body.longURL, userID: user_id };
  res.redirect(`/urls/${tinyUrlId}`);
});

app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const id = req.params.id;

  if (!user_id) {
    return res.status(400).send("Only signed in user can update owned URL(s)");
  }
  
  const urls = urlsForUser(urlDatabase, user_id);

  if (!urls[id]) {
    return res.status(400).send("You can only update owned URL(s)");
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

///////////////////////////////////////////////////
// END of Tiny APP URL CRUD ROUTES
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// Login & Logout routes
///////////////////////////////////////////////////

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id) {
   return res.redirect("/urls");
  }

  const templateVars = { user_id };
  res.render("login", templateVars);  
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  const password = req.body.password;

  if (user === null) {
    return res
      .status(403)
      .send("The email entered does not exist. Please register to use the App");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("The email or password is not correct");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
///////////////////////////////////////////////////
// End of Login & Logout routes
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// Port listening
///////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
