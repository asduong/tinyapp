const express = require("express");
const app = express();
const PORT = 8080; // default ports 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const helper = require('./helpers');

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
};

app.use(cookieSession({
  name: 'session',
  keys: [ /* secret keys */ "id"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("view engine", "ejs");

// Generate a random string to create a key
const generateRandomString = () => {
  let key = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  res.render("urls_new", templateVars);
});



app.post("/urls", (req, res) => {
  const key = generateRandomString();
  const longURL = req.body.longURL;

  if (!req.session.user_id) {
    res.redirect("/urls");
  } else if (req.session.user_id) {
    urlDatabase[key] = {
      longURL: longURL,
      userID: req.session.user_id
    };
    res.redirect(`./urls/${key}`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  res.render("urls_show", templateVars);
});

const urlsForUser = (userID) => {
  const userURL = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURL[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURL;
};

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    urlsForUser(req.session.user_id);
    res.render("urls_index", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send(403);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }

  res.redirect("/urls");

});
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    urlsForUser(req.session.user_id);
  }

  // urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL/", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {

  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  console.log(users);
  if (req.body.email === '' || req.body.password === '') {
    res.send(404);
  } else {
    req.session.user_id = users[userID].id;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  for (let user in users) {
    console.log(users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password));
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      // console.log(helper.getUserByEmail(users[user].email, users)); //called here
      req.session.user_id = user;
      res.redirect("/urls");
    }
  }
  res.send(403);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});