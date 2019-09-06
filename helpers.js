const getUserByEmail = function (email, database) {
  // lookup magic...
  return database[email];
};

module.exports = {
  getUserByEmail
};