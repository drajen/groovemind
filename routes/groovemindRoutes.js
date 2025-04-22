// Imports and dependencies
const express = require('express'); 
const router = express.Router();
const controller = require('../controllers/groovemindControllers.js'); //import the controller for handling requests
const {login} = require('../auth/auth')
const { check } = require('express-validator');


router.get("/", controller.show_home);

router.get('/courses', controller.landing_page);

router.get('/new', controller.new_entry);

//router.get('/courses/new', controller.new_entry);

router.post('/courses', controller.add_course);

router.put('/courses/:id', controller.update_course);

router.delete('/courses/:id', controller.delete_course);

//router.post('/courses/:id/book', controller.book_course);
//Booking form validation
router.post('/courses/:id/book', [
    check('firstName').trim().escape().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    check('lastName').trim().escape().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    check('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    check('phone').optional().trim().isMobilePhone().withMessage('Invalid phone number')
  ], controller.book_course)
;

router.get('/courses/:id/classlist', controller.class_list);

router.get('/courses/:id/classlist/view', controller.class_list_view);

router.get('/courses/:id/book', controller.book_course_view);

router.get('/booking-success', controller.booking_success);

router.get('/register', controller.show_register_page);

// Registration form validation
router.post(
  '/register',
  [
    check('username')
      .trim()
      .escape()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    
    check('pass')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 5 }).withMessage('Password must be at least 5 characters')
  ],
  controller.post_new_user
);

router.get('/login', controller.show_login_page);

//router.post('/login', login, controller.handle_login);

router.post('/login', controller.handle_login);

router.get('/logout', controller.logout);

router.post('/courses/:id/classes', controller.add_class_to_course);

router.delete('/courses/:id/classes/:classIndex', controller.delete_class);

router.put('/courses/:id/classes/:classIndex', controller.update_class);

router.post('/courses/:id/bookings/remove', controller.remove_user_from_course);

// GET: Organiser Dashboard
router.get('/organiser/dashboard', controller.organiser_dashboard);

// GET: Show form to add organiser
router.get('/organisers/add', controller.show_add_organiser_form);

// POST: Handle add organiser form submission
router.post('/organisers/add', controller.add_organiser);

// GET: Show form to delete organiser
router.get('/organisers/delete', controller.show_delete_organiser_form);

// POST: Handle delete organiser form submission
router.post('/organisers/delete', controller.delete_organiser);

// GET: Show form to add class to a course
router.get('/courses/:id/classes/new', controller.show_add_class_form);

// GET: Show form to edit a course
router.get('/courses/:id/edit', controller.show_edit_course_form);

router.get('/courses/:id/classes/:classIndex/edit', controller.show_edit_class_form);

router.post('/courses/:id/classes/:classIndex/delete', controller.delete_class);

router.get('/contact', controller.show_contact_page);

router.get('/about', controller.about_page);

router.use(function(req, res) {
    res.status(404);
    res.type('text/plain');
    res.send('404 Not found.');
})

router.use(function(err, req, res, next) {
    res.status(500);
    res.type('text/plain');
    res.send('Internal Server Error.');
})

module.exports = router;

