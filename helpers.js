//Helper functions --------
//find user_id by email in database
const findUserIdByEmail = (email, db) => {
  for(let key in db) {
    if (db[key]["email"] === email) {
      return db[key]["id"];
    }
  }
}

//find user password by email in database
const findUserPasswordByEmail = (email, db) => {
  for(let key in db) {
    if (db[key]["email"] === email) {
      return db[key]["password"];
    }
  }
}

//check if the user with provided email exists in database
function emailExists(email, db) {
  for(let key in db) {
    if (key["email"] === email) {
      return true;
    }
  }
  return false;
}
//generate random string
function generateRandomString(num) {
  return Math.random().toString(36).substring(2, num+2);
 } 
 //  console.log(generateRandomString());

 //find URLs that belong to the particular User
 function urlsForUser(id, db) {
   userURLs = {};
   for(let key in db) {
     if (db[key].userID == id) {
      userURLs[key] = db[key].longURL;
     }
   }
   return userURLs;
 }



module.exports = {
  findUserIdByEmail, findUserPasswordByEmail, emailExists,
  generateRandomString, urlsForUser
}