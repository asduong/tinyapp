const express = require("express");
const app = express();
const PORT = 8080; // default ports 8080
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");

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

app.use(cookie());

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
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_new", templateVars);
});



app.post("/urls", (req, res) => {
  const key = generateRandomString();
  const longURL = req.body.longURL;

  if (!req.cookies["user_id"]) {
    res.redirect("/urls");
  } else if (req.cookies["user_id"]) {
    urlDatabase[key] = {
      longURL: longURL,
      userID: req.cookies["user_id"]
    };
    // for (let key in urlDatabase) {
    //   if (urlDatabase[key].userID === req.cookies["user_id"]) {
    //     userURL[key] = longURL;
    //     console.log(userURL);
    //   }
    // }
    res.redirect(`./urls/${key}`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_show", templateVars);
});

const urlsForUser = (userID) => {
  const userURL = {};
  for (let element in urlDatabase) {
    if (urlDatabase[element].userID === userID) {
      userURL[element] = urlDatabase[element].longURL;
    }
  }
  return userURL;
};

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  if (!req.cookies["user_id"]) {
    res.render("urls_index", templateVars);
  } else {
    urlsForUser(req.cookies["user_id"]);
    res.render("urls_index", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send(404);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  // });
});
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL/", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    // change longURL from here
    longURL: urlDatabase,
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// app.post("/login", (req, res) => {
//   res.cookie("user_id", req.body.email);
//   res.redirect("/urls");
// });

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.email);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_register", templateVars);
});

// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// };
app.post("/register", (req, res) => {
  // req.body.email
  // req.body.password
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  if (req.body.email === '' || req.body.password === '') {
    res.send(404);
  } else {
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user].email === req.body.email && users[user].password === req.body.password) {
      res.cookie("user_id", user);
      res.redirect("/urls");
    }
  }
  res.send(403);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});