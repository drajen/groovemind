const nedb = require('gray-nedb'); 

class Courses {
    constructor(dbFilePath) {
      if (dbFilePath) {
        this.db = new nedb({ filename: dbFilePath, autoload: true });
        console.log('DB connected to ' + dbFilePath);
      } else {
        this.db = new nedb();
      }
    }
    
    // Initialize the database with a sample course entry
    init() {
      this.db.insert({
        name: 'Beginner Salsa',
        description: 'Introductory Salsa course for all fitness levels',
        duration: '8 weeks',
        location: 'GrooveMind Garnethill',
        price: 80,
        classes: [
          { date: '2025-04-15', time: '18:00', description: 'Beginner Salsa - Week 1' },
          { date: '2025-04-22', time: '18:00', description: 'Beginner Salsa - Week 2' }
        ]
      });

      //To confirm that the course was inserted
      console.log('Course entry inserted');
    }
  
    //Method to return all courses
    getAllCourses() {
      return new Promise((resolve, reject) => {
        this.db.find({}, function(err, courses) {
          if (err) {
            reject(err);
          } else {
            resolve(courses);
            console.log('function getAllCourses() returns: ', courses);
          }
        });
      });
    }
   
    //Method to return courses by location
    getCoursesByLocation(location) {
      return new Promise((resolve, reject) => {
        this.db.find({ location: location }, function(err, entries) {
          if (err) {
            reject(err);
          } else {
            resolve(entries);
            console.log('getCoursesByLocation() returns: ', entries);
          }
        });
      });
    }

    //Method to add a course
    addCourse(courseData) {
      return new Promise((resolve, reject) => {
        this.db.insert(courseData, function (err, newDoc) {
          if (err) {
            reject(err);
          } else {
            resolve(newDoc);
            console.log('New course added:', newDoc);
          }
        });
      });
    }
    
    //Method to update a course
    updateCourse(id, updatedCourse) {
      return new Promise((resolve, reject) => {
        this.db.update({ _id: id }, { $set: updatedCourse }, {}, function (err, numReplaced) {
          if (err) {
            reject(err);
          } else {
            resolve(numReplaced);
            console.log(`Course ${id} updated (${numReplaced} document(s) replaced)`);
          }
        });
      });
    }

    //Method to delete a course
    deleteCourse(id) {
      return new Promise((resolve, reject) => {
        this.db.remove({ _id: id }, {}, function (err, numRemoved) {
          if (err) {
            reject(err);
          } else {
            resolve(numRemoved);
            console.log(`Course ${id} deleted (${numRemoved} document(s) removed)`);
          }
        });
      });
    }
    
    //Method to book a course
    bookCourse(courseId, bookingData) {
      return new Promise((resolve, reject) => {
        this.db.update({ _id: courseId }, 
          { $push: { bookings: bookingData } }, 
          {}, 
          function (err, numReplaced) {
          if (err) {
            reject(err);
          } else {
            resolve(numReplaced);
            console.log(`Booking added to course ${courseId} (${numReplaced} document(s) updated)`);
          }
        });
      });
    }


    //Method to get bookings for a specific course
    getBookings(courseId) {
      return new Promise((resolve, reject) => {
        this.db.findOne({ _id: courseId }, function (err, course) {
          if (err) {
            reject(err);
          } else if (!course) {
            resolve(null);
          } else {
            resolve(course.bookings || []);
            console.log('Bookings:', course.bookings);
          }
        });
      });
    }

    //Method to add a new class to a course
    addClassToCourse(courseId, classData) {
      return new Promise((resolve, reject) => {
        this.db.update(
          { _id: courseId },
          { $push: { classes: classData } },
          {},
          function (err, numReplaced) {
            if (err) {
              reject(err);
            } else {
              resolve(numReplaced);
              console.log(`Class added to course ${courseId}`);
            }
          }
        );
      });
    }

    //Method to delete a class from a course
    deleteClassFromCourse(courseId, classIndex) {
      return new Promise((resolve, reject) => {
        this.db.findOne({ _id: courseId }, (err, course) => {
          if (err || !course) {
            reject('Course not found');
          } else {
            course.classes.splice(classIndex, 1);
            this.db.update({ _id: courseId }, { $set: { classes: course.classes } }, {}, (err, numReplaced) => {
              if (err) {
                reject(err);
              } else {
                resolve(numReplaced);
                console.log(`Class at index ${classIndex} deleted from course ${courseId}`);
              }
            });
          }
        });
      });
    }
    
    //Methiod to update a class in a course
    updateClassInCourse(courseId, classIndex, updatedClass) {
      return new Promise((resolve, reject) => {
        this.db.findOne({ _id: courseId }, (err, course) => {
          if (err || !course) {
            reject("Course not found");
          } else {
            course.classes[classIndex] = updatedClass;
            this.db.update(
              { _id: courseId },
              { $set: { classes: course.classes } },
              {},
              (err, numReplaced) => {
                if (err) reject(err);
                else resolve(numReplaced);
              }
            );
          }
        });
      });
    }

    //Method to remove a participant/user from a course
    removeUserFromCourse(courseId, email) {
      return new Promise((resolve, reject) => {
        this.db.findOne({ _id: courseId }, (err, course) => {
          if (err || !course) {
            reject('Course not found');
          } else {
            const updatedBookings = course.bookings.filter(
              (booking) => booking.email !== email
            );
            this.db.update(
              { _id: courseId },
              { $set: { bookings: updatedBookings } },
              {},
              (err, numReplaced) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(numReplaced);
                  console.log(`User with email ${email} removed from course ${courseId}`);
                }
              }
            );
          }
        });
      });
    }

    // Method to get a course by ID
    getCourseById(courseId) {
      return new Promise((resolve, reject) => {
        this.db.findOne({ _id: courseId }, function (err, course) {
          if (err) {
            reject(err);
          } else {
            resolve(course);
          }
        });
      });
    }



}
  
  
module.exports = Courses;
