const { assert } = require('chai');

const { findUserIdByEmail } = require('../helpers.js');

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

describe('findUserIdByEmail', function() {
  it('should return user id found by email', function() {
    const userId = findUserIdByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert(userId == expectedOutput, 'user ID == userRandomID');
  });
  it('should return undefined if user email not exists in DB', function() {
    const userId = findUserIdByEmail("nouser@example.com", testUsers);
    const expectedOutput = undefined;
    assert(userId == expectedOutput, 'user ID == userRandomID');
  });

});