# GrooveMind Dance Collective Booking Application

GrooveMind is a full-stack Node.js application designed for a local organisation to manage dance class courses and bookings. It supports participant registration, organiser management, secure login, and class/course CRUD operations.

This project was developed as part of the Web Application Development 2 coursework at Glasgow Caledonian University.

## Tech Stack
- Node.js
- Express.js
- NeDB (local JSON-based database)
- Mustache Templates
- Bootstrap 4.4.1 (via CDN)
- FontAwesome
- Postman (for API testing)

## Security Features
- Secure password hashing with `bcrypt`
- JWT-based authentication
- Role-based access (Organiser dashboard protected)
- `.env` used for secret key (`JWT_SECRET`)
- Cookie-based token handling
- Organiser logout clears session instantly

## Implemented Features

### As per Specification:
- View organisation info, courses, class details
- Book/enrol in a course without login
- Organiser login + dashboard
- Organisers can:
  - Add/update/delete courses
  - Add/update/delete classes within courses
  - View participant lists
  - Add/remove organisers
  - Remove participants from courses

### Additional Features with Justifications

- **Organiser Dashboard** – Centralised admin panel for course, class, and organiser management.  
  Not explicitly required in the spec but improves usability and aligns with the organiser's tasks.

- **Form Validation (client + server)**  
  - HTML5 and Bootstrap classes used for frontend validation.  
  - `express-validator` used for key backend forms (registration, booking).

- **Improved UX through Feedback & Alerts**  
  - Mustache-based error messages shown on login, register, and booking forms.  
  - Alerts guide users if input is invalid or if actions fail.

- **Responsive Design** – Layout and navigation adapt well across screen sizes using Bootstrap 4.4.1.

- **Simplified Navbar Logic** – Originally planned conditional login link was removed for simplicity and visibility.  
  This change was intentional and does not impact security or route protection.

These extras improve usability, maintainability, and the professionalism of the platform.


## Testing

### System Testing
Manual system testing was performed across the full application, including:

- Navigation
- Course and class display
- Booking flow
- Organiser login and admin functionality
- Logout behaviour and protected route access
- Form validation and error handling

🔹 All tests were carried out from both organiser and participant perspectives.  
🔹 Test results are documented in `GrooveMind_Test_Report_S2159716.docx` (submitted as a supporting document).  
🔹 No automated testing tools were used — all tests were conducted manually for precision and realism.

### API Testing
All major API routes were tested using **Postman**, including:

- Add / update / delete course
- Add / update / delete class
- Book course
- Register/login organiser

Test results are documented in `GrooveMind_API_Endpoint_Test_S2159716.docx`, submitted separately.  

## How to Run the Application

1. **Clone the repository**
   open Terminal
   git clone <git-url>
   cd GrooveMind

2. **Install dependencies**
   npm install

3. **Create a .env file in the root directory with:**
  JWT_SECRET=<yourSecretKey>

4. **Start the application**
   node index.js

5. **Access the site**
   http://localhost:3000


## Live URL for Demo 

## Author
- Dharrish Rajendram
- Student ID: S2159716
- Glasgow Caledonian University
- Apprentice Software Engineer