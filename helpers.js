
/////////////////////////////////////////////
//////////////Helper Functions///////////////
////////////////////////////////////////////
/**It returns user's object. Parameters: email: email of the user,database: the user database object */
const getUserByEmail = function(email,database) {
  let foundUser = null;

  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }

  return foundUser;
};


/**It return the user object of the a of specific userid supplied as parameter. urldatabase is the object that URLs */
const urlsForUser = function(urldatabase, userid) {
  const result = {};

  for (let shortUrl in urldatabase) {
    if (urldatabase[shortUrl].userID === userid) {
      result[shortUrl] = urldatabase[shortUrl];
    }
  }

  return result;
};
/**This function generate a random and unique  ID. It takes the length of the ID to be generated as parameter*/
const generateRandomString = function(randomLength) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < randomLength; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};
/**Function return the email address of a given user id */
const getUserEmail = function(user_id, users) {
  return users[user_id] ? users[user_id].email: undefined;
};
/////////////////////////////////////////////
//////////////End of Helper Functions///////////////
////////////////////////////////////////////

module.exports = { getUserByEmail, generateRandomString, urlsForUser, getUserEmail };