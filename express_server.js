const express = require("express");
const app = express();
const PORT = 8080; // default ports 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

// database of the users
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

// Database of the URLs
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

// re-directs the pages to /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// renders the create new URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  res.render("urls_new", templateVars);
});

// Adds URLs to the database and re-directs to the new URL created
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

// Shows the page of the URL that was created
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  res.render("urls_show", templateVars);
});

// Function to check if the URL ID matches the User ID it will append to userURL
const urlsForUser = (userID) => {
  const userURL = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURL[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURL;
};

// Displays the front page rendering from urls_index page
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

// Allows other users to see the pages created
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send(403);
  }
});

// Allows logged in user to delete their own link
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// Allows logged in user to edit their own link
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    urlsForUser(req.session.user_id);
  }
  res.redirect("/urls");
});

// Renders the newly created URL
app.get("/urls/:shortURL/", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// Allows user to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


// Renders the registration page
app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };

  res.render("urls_register", templateVars);
});

// Allows user to create a login ID(email and password)
app.post("/register", (req, res) => {

  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  if (req.body.email === '' || req.body.password === '') {
    res.send(404);
  } else {
    req.session.user_id = users[userID].id;
    res.redirect("/urls");
  }
});

// Renders the login page
app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

// Allows user to login checking credentials against the users database
app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = user;
      res.redirect("/urls");
    }
  }
  res.send(403);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

module.exports = {
  users
};