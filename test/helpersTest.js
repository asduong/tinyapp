const users = require("../express_servers.js");

const {
  assert
} = require('chai');

const {
  getUserByEmail
} = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(testUsers.userRandomID.email === "user@example.com", 'User exists!');
  });
  it('should return undefined', function () {
    const user = getUserByEmail("usr@example.com", users);
    const expectedOutput = "usrRandomID";
    // Write your assert statement here
    assert(testUsers["usr@example.com"] === undefined, 'User does not exist!');
  });
});