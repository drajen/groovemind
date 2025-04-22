// Imports and dependencies
const CourseDAO = require('../models/coursesModel');
const db = new CourseDAO('courses.db');
const userDao = require('../models/userModel');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Render the landing page with course data
exports.landing_page = function(req, res) {
    const token = req.cookies.jwt;
    let organiser = false;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      organiser = decoded.role === 'organiser';
    } catch (err) {
      organiser = false;
    }

    db.getAllCourses()
    .then((list) => {
      // Debugging line
      console.log('Rendering entries.mustache with data:');
      console.log(JSON.stringify(list, null, 2));

      res.render('entries', {
        title: 'GrooveMind Dance Courses',
        entries: list,
        user: true
     });
      console.log('promise resolved');
    })
    .catch((err) => {
      console.log('promise rejected', err);
      res.status(500).send('Oops! Something went wrong. Please try again later.');
    });
};


// Render the about page
exports.about_page = function(req, res) {
  res.render('about', {
    title: 'About GrooveMind Dance Collective'
  });
};


// Render the new course entry page
exports.new_entry = function(req, res) {
    //res.send('<h1>Not yet implemented: show a new course entry page.</h1>');
    res.render('newEntry', {
      title: 'Add a New Course'
    });
};  


// Add a new course
// This function is called when a new course is added
exports.add_course = function(req, res) {
  const formData = req.body;

  // Transform flat class inputs into an array of class objects
  const classes = [];
  for (let i = 0; i < 4; i++) {
    const date = formData[`classes[${i}][date]`];
    const time = formData[`classes[${i}][time]`];
    const description = formData[`classes[${i}][classDescription]`];

    if (date && time && description) {
      classes.push({
        date,
        time,
        classDescription: description
      });
    }
  }

  const course = {
    name: formData.name,
    description: formData.description,
    duration: formData.duration,
    location: formData.location,
    price: formData.price,
    classes: classes
  };

    db.addCourse(course)
      .then((newDoc) => {
          res.redirect('/organiser/dashboard');
        })
      .catch((err) => {
        console.error("Error adding course:", err); // Debugging line
        res.status(500).json({ error: 'Failed to add course' });
      });
};

// Update a course
// This function is called when a course is updated
exports.update_course = function(req, res) {
  const courseId = req.params.id;
  const updatedData = req.body;

  db.updateCourse(courseId, updatedData)
    .then((numReplaced) => {
      if (numReplaced > 0) {
        res.redirect('/organiser/dashboard');
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to update course' });
    });
};

// Delete a course
// This function is called when a course is deleted
exports.delete_course = function(req, res) {
  const courseId = req.params.id;

  db.deleteCourse(courseId)
    .then((numRemoved) => {
      if (numRemoved > 0) {
        res.redirect('/organiser/dashboard');
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to delete course' });
    });
};

// Book a course
// This function is called when a user submits the booking form
exports.book_course = function(req, res) {
  const courseId = req.params.id;
  const bookingData = req.body;

  // 1 - Handle express-validator result
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Re-render the booking form with error messages
    return res.status(422).render('book', {
      title: 'Book This Course',
      courseId: courseId, // send back the course ID so form can stay intact
      errors: errors.array() // this gets looped in book.mustache
    });
  }
  
  // 2 - If no validation errors, proceed with booking
  db.bookCourse(courseId, bookingData)
    .then((numReplaced) => {
      if (numReplaced > 0) {
        //res.json({ message: 'Course booked successfully' });
        res.redirect('/booking-success');
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    })
    .catch((err) => {
      console.error('Booking failed:', err);
      res.status(500).send('Oops! Something went wrong. Please try again later.');
      //res.status(500).json({ error: 'Failed to book course' });
    });
};

// Render the booking form view
exports.book_course_view = function(req, res) {
  const courseId = req.params.id;

  try {
    res.render('book', {
      title: 'Book This Course',
      courseId: courseId
    });
    console.log('view rendered: booking form displayed');
  } catch (err) {
    console.error('view rendering failed:', err);
    res.status(500).send('Oops! Something went wrong. Please try again later.');
  }
};

// Render the booking success page
exports.booking_success = function(req, res) {
  try {
    res.render('bookingSuccess', {
      title: 'Booking Confirmed'
    });
    console.log('view rendered: booking confirmation shown');
  } catch (err) {
    console.error('view rendering failed:', err);
    res.status(500).send('Oops! Something went wrong. Please try again later.');
  }
};

// Get the class list for a specific course
// This function is called when a user wants to see the class list for a course
exports.class_list = function(req, res) {
    const courseId = req.params.id;
  
    db.getBookings(courseId)
      .then((bookings) => {
        if (bookings === null) {
          res.status(404).json({ message: 'Course not found' });
        } else {
          res.json({ classList: bookings });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: 'Failed to retrieve class list' });
      });
};


// Render the class list view
exports.class_list_view = function(req, res) {
  const courseId = req.params.id;

  db.getBookings(courseId)
    .then((bookings) => {
      //const bookings = courses[0]?.bookings || [];
      //const bookings = course.bookings || [];
      res.render('classList', { 
        title: 'Class List',
        classList: bookings,
        courseId: courseId
      });
      console.log('promise resolved: class list rendered');
    })
    .catch((err) => {
      console.error('promise rejected:', err);
      res.status(500).send('Oops! Something went wrong. Please try again later.');
    });
};

exports.show_register_page = function (req, res) {
  res.render("user/register", {
    title: "Register for GrooveMind Admin Access"
  });
};


exports.post_new_user = function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/register", {
      title: "Register for GrooveMind Admin Access",
      errors: errors.array()
    });
  }
  
  const user = req.body.username;
  const password = req.body.pass;

  if (!user || !password) {
    res.status(401).send('Missing username or password');
    return;
  }

  userDao.lookup(user, function (err, u) {
    if (u) {
      console.log("User already exists:", user);
      res.status(409).send("User already exists");
    } else {
      userDao.create(user, password);
      console.log("Registered new user:", user);
      res.redirect('/login');
    }
  });
};


// Handle organiser login
// This function is called when a organiser tries to log in
exports.handle_login = function (req, res) {
  console.log("Login route hit"); // Debugging line
  const username = req.body.username;
  const password = req.body.pass;

  userDao.lookup(username, function (err, user) {
    if (!user) {
      console.log("User not found:", username);
      return res.status(401).render("user/login", {
        title: "Sign In",
        errors: [{ msg: "Invalid username or password" }]
      });
    }

    // Compare hashed password
    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        console.log("Password mismatch for:", username);
        return res.status(401).render("user/login", {
          title: "Sign In",
          errors: [{ msg: "Invalid username or password" }]
        });
      }

      const role = user.role || "organiser"; // fallback if role is missing
      const token = jwt.sign({ username: user.user, role }, process.env.ACCESS_TOKEN_SECRET);
      res.cookie("jwt", token);

      console.log(`Login successful: ${username} (${role})`);

      if (role === "organiser") {
        return res.redirect("/organiser/dashboard");
      } else {
        return res.redirect("/courses");
      }
    });
  });
};

// Render the home page
exports.show_home = function(req, res) {
  res.render("home", { title: "Welcome to GrooveMind Dance Collective" });
};


// Add a new organiser
// This function is called when a new organiser is registered
exports.add_organiser = function (req, res) {
  const usernameToAdd = req.body.username;
  const password = req.body.password;

  if (!usernameToAdd || !password) {
    console.log('Missing username or password');
    return res.redirect('/organisers/add');
  }

  userDao.lookup(usernameToAdd, function (err, user) {
    if (user) {
      console.log(`Organiser already exists: ${usernameToAdd}`);
      return res.redirect('/organisers/add?error=exists');
    } else {
      userDao.create(usernameToAdd, password);
      console.log(`Organiser '${usernameToAdd}' added successfully`);
      return res.redirect('/organiser/dashboard')
    }
  });
};

// Delete an organiser
// This function is called when an organiser is deleted
// Delete an organiser
exports.delete_organiser = function(req, res) {
  const usernameToDelete = req.body.username;

  if (!usernameToDelete) {
    console.log('No username provided');
    return res.redirect('/organisers/delete'); // Go back to form
  }

  userDao.delete(usernameToDelete)
    .then((numRemoved) => {
      if (numRemoved > 0) {
        console.log(`Organiser '${usernameToDelete}' deleted`);
      } else {
        console.log(`Organiser '${usernameToDelete}' not found`);
      }
      res.redirect('/organiser/dashboard');
    })
    .catch((err) => {
      console.error('Error deleting user:', err);
      res.redirect('/organiser/dashboard');
    });
};

// Add a class to a course
// This function is called when a new class is added to a course
exports.add_class_to_course = function (req, res) {
  const courseId = req.params.id;
  const classData = req.body;

  db.addClassToCourse(courseId, classData)
    .then((numReplaced) => {
      if (numReplaced > 0) {
        res.redirect('/organiser/dashboard');
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to add class" });
    });
};

// Delete a class from a course
// This function is called when a class is deleted from a course
exports.delete_class = function(req, res) {
  const courseId = req.params.id;
  const classIndex = parseInt(req.params.classIndex);

  db.deleteClassFromCourse(courseId, classIndex)
    .then((numReplaced) => {
      if (numReplaced > 0) {
        res.redirect('/organiser/dashboard');
      } else {
        res.status(404).json({ message: 'Course not found or no changes made' });
      }
    })
    .catch((err) => {
      console.error('Error deleting class:', err);
      res.status(500).json({ error: 'Failed to delete class' });
    });
};

// Update a class in a course
// This function is called when a class is updated in a course
exports.update_class = function(req, res) {
  const courseId = req.params.id;
  const classIndex = parseInt(req.params.classIndex);
  const updatedClass = req.body;

  db.updateClassInCourse(courseId, classIndex, updatedClass)
    .then((numReplaced) => {
      if (numReplaced > 0) {
        res.redirect('/organiser/dashboard');
      } else {
        res.status(404).json({ message: 'Course not found or no changes made' });
      }
    })
    .catch((err) => {
      console.error('Error updating class:', err);
      res.status(500).json({ error: 'Failed to update class' });
    });
};

//optional as edit course can edit class too - remove if not needed
exports.show_edit_class_form = function (req, res) {
  const courseId = req.params.id;
  const classIndex = parseInt(req.params.classIndex);

  db.getCourseById(courseId).then(course => {
    if (!course || !course.classes || !course.classes[classIndex]) {
      return res.status(404).send("Class not found");
    }

    const selectedClass = course.classes[classIndex];
    res.render('user/updateClass', {
      title: 'Edit Class',
      courseId,
      classIndex,
      classData: selectedClass
    });
  }).catch(err => {
    console.error("Error loading class:", err);
    res.status(500).send("Failed to load class");
  });
};

// Render form to add a new class to a course
exports.show_add_class_form = function (req, res) {
  const courseId = req.params.id;
  res.render('user/addClass', {
    title: 'Add a Class',
    courseId: courseId
  });
};

// Render form to edit a course
exports.show_edit_course_form = function (req, res) {
  const courseId = req.params.id;
  db.getCourseById(courseId).then(course => {
    if (course) {
      res.render('user/editCourse', {
        title: 'Edit Course',
        course: course
      });
    } else {
      res.status(404).send("Course not found");
    }
  }).catch(err => {
    res.status(500).send("Failed to load edit form");
  });
};

// Remove a user from a course
// This function is called when a user is removed from a course
exports.remove_user_from_course = function(req, res) {
  const courseId = req.params.id;
  const email = req.body.email;

  db.removeUserFromCourse(courseId, email)
    .then((numReplaced) => {
      if (numReplaced > 0) {
        res.redirect(`/courses/${courseId}/classlist/view`);
      } else {
        res.status(404).json({ message: 'User or course not found' });
      }
    })
    .catch((err) => {
      console.error('Error removing user:', err);
      res.status(500).json({ error: 'Failed to remove user' });
    });
};


// Render the organiser dashboard view with course data
exports.organiser_dashboard = function (req, res) {
  db.getAllCourses()
    .then((courses) => {
      // Add index to each class
      courses.forEach(course => {
        course.classes = course.classes?.map((cls, i) => ({
          ...cls,
          index: i
        }));
      });

      res.render('user/organiserDashboard', {
        title: 'Organiser Dashboard',
        entries: courses,
        organiser: true
      });
    })
    .catch((err) => {
      res.status(500).send('Failed to load dashboard');
    });
};

// Render form to add a new organiser
exports.add_organiser_view = function (req, res) {
  res.render('user/addOrganiser', {
    title: 'Add a New Organiser'
  });
};

// Render form to delete an organiser
exports.delete_organiser_view = function (req, res) {
  res.render('user/deleteOrganiser', {
    title: 'Remove an Organiser'
  });
};

// Render form to add a new organiser
exports.show_add_organiser_form = function (req, res) {
  res.render('user/addOrganiser', { title: 'Add a New Organiser' });
};

// Render form to delete an organiser
exports.show_delete_organiser_form = function (req, res) {
  res.render('user/deleteOrganiser', { title: 'Delete an Organiser' });
};

// Render the contact page
exports.show_contact_page = function (req, res) {
  res.render('contact', { title: 'Contact Us' });
};

//Redirect to the home page, clearthe cookie upon logout
exports.logout = function (req, res) {
  res.clearCookie("jwt").status(200).redirect("/");
};

// Render the login page
exports.show_login_page = function(req, res) {
  res.render("user/login", {
    title: "Sign In"
  });
};