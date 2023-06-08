
let chai = require('chai');
let assert = chai.assert;

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id,expectedUserID);
 
  });

  it('should return a valid user object', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = {
      
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    
    };
    assert.deepEqual(user,expectedUser);
  });

  it('should return undefined for non-existence email', function() {
    const user = getUserByEmail("user@example45.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user,expectedUserID);
 
  });
});