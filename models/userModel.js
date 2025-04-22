const Datastore = require("gray-nedb");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class UserDAO {
  constructor(dbFilePath) {
    if (dbFilePath) {
        // Embedded database
      this.db = new Datastore({ filename: dbFilePath, autoload: true });
    } else {
      this.db = new Datastore(); // In-memory
    }
  }

  // For testing purposes only
  // Initialize the database with some users
  // Password is the bcrypt of the user name
  init() {
    this.db.insert({
      user: 'Peter',
      password: '$2b$10$I82WRFuGghOMjtu3LLZW9OAMrmYOlMZjEEkh.vx.K2MM05iu5hY2C'
    });
    this.db.insert({
      user: 'Ann',
      password: '$2b$10$bnEYkqZM.MhEF/LycycymOeVwkQONq8kuAUGx6G5tF9UtUcaYDs3S'
    });
    return this;
  }

  // Register organiser
  create(username, password, role = 'organiser') {
    const that = this;
    bcrypt.hash(password, saltRounds).then(function (hash) {
      const entry = { user: username, password: hash, role: role };
      that.db.insert(entry, function (err) {
        if (err) {
          console.log("Can't insert user:", username);
        } else {
          console.log("User created:", username);
        }
      });
    });
  }

  // Look up user for login
  lookup(user, cb) {
    this.db.find({ user: user }, function (err, entries) {
      if (err || entries.length === 0) {
        return cb(null, null);
      }
      return cb(null, entries[0]);
    });
  }

  // Delete organiser by username
  delete(username) {
    return new Promise((resolve, reject) => {
      this.db.remove({ user: username }, {}, function (err, numRemoved) {
        if (err) {
          reject(err);
        } else {
          resolve(numRemoved);
          console.log(`User ${username} deleted (${numRemoved} record(s) removed)`);
        }
      });
    });
  }
}

const dao = new UserDAO('users.db');
//dao.init();

module.exports = dao;