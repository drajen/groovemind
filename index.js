// Load environment variables from .env file
require('dotenv').config();

// Core modules and middleware
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // Security middleware to set secure HTTP headers

// Initialise the Express application
const app = express();

// Apply security middleware 
// sets HTTP headers to protect against common vulnerabilities
app.use(helmet());

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse JSON and form submissions
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded form data

// Middleware to override methods
// Allows using PUT and DELETE methods in forms
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


// Serve static files from the 'public' folder
const public = path.join(__dirname, 'public');
app.use(express.static(public));

// Set up Mustache as the view engine
const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Register routes
const router = require('./routes/groovemindRoutes');
app.use('/', router); // Mount all app routes

// Start the server
app.listen(3000, () => {
  console.log('GrooveMind dance class booking application server started on port 3000. Ctrl^c to quit.');
});