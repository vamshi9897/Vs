require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
const cors = require("cors");
const cookie = require('cookie-parser');
const transporter = require('./files/transporter');
const blogPosts = require('./files/data');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));


app.use(cookie('secret'));

const upload = multer();
app.use(cors({ origin: "http://yourfrontend.com", credentials: true }));

app.use(session({
    secret: "9897",
    resave: false,   // Set to false to avoid unnecessary session updates
    saveUninitialized:true,  // Avoid saving empty sessions
    cookie: { secure: false }  // Set to false for local development
}));


app.use(flash());

// app.use((req, res, next) => {
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).render("error", { errorMessage: err.message });
});

// Routes
app.get('/', (req, res, next) => {
    try { 
        const success=req.flash('success')
        const error=req.flash('error')
        console.log("Flash Messages in GET / Route:", { success, error }); // Debugging
       const success1=success[0]
       const error1=error[0]

        res.render('Home',{success1,error1});
    } catch (err) {
        next(err);
    }
});

app.get('/about', (req, res, next) => {
    try {
        res.render('About');
    } catch (err) {
        next(err);
    }
});

app.get('/services', (req, res, next) => {
    try {
        res.render('Services');
    } catch (err) {
        next(err);
    }
});

app.get('/teacher', (req, res, next) => {
    try {
        res.render('Teacher');
    } catch (err) {
        next(err);
    }
});

app.post('/teacher', upload.none(), async (req, res) => {
    try {
        // console.log("Session Data Before Flash:", req.session);

        // Extracting request body data
        const { firstName, lastName, email, phone, experience = "Not Provided", standard, message, area, alternatephone, subject } = req.body;
        
        // Ensure `standard` is always an array
        const standardList = Array.isArray(standard) ? standard : standard ? [standard] : [];
        const standardText = standardList.join(", ");

        // Mail options
        let mailOptions = {
            from: email,
            to: 'vstuitions2017@gmail.com',
           
           
            subject: `New Tutor Form Submission - ${subject}`,
            html: `
                <h2>New Tutor Form Submission</h2>
                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <tr><th>Field</th><th>Details</th></tr>
                    <tr><td><strong>Name</strong></td><td>${firstName} ${lastName}</td></tr>
                    <tr><td><strong>Email</strong></td><td>${email}</td></tr>
                    <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
                    <tr><td><strong>Alternate Phone</strong></td><td>${alternatephone || "Not Provided"}</td></tr>
                    <tr><td><strong>Area</strong></td><td>${area || "Not Provided"}</td></tr>
                    <tr><td><strong>Experience</strong></td><td>${experience}</td></tr>
                    <tr><td><strong>Subject</strong></td><td>${subject}</td></tr>
                    <tr><td><strong>Standards they Teach</strong></td><td>${standardText || "Not Provided"}</td></tr>
                    <tr><td><strong>Message</strong></td><td>${message || "No message provided"}</td></tr>
                </table>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        // Flash success message & save session before redirect
        req.flash("success", "Email sent successfully!");
        req.session.save(() => res.redirect("/"));
        
    } catch (error) {
        console.error("Error sending email:", error);
        
        req.flash("error", "Error sending email.");
        req.session.save(() => res.redirect('/'));
    }
});


app.get('/student', (req, res, next) => {
    try {
        res.render('Student');
    } catch (err) {
        next(err);
    }
});

app.post('/student', upload.none(), async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subjects, message, area, board, grade,alternatephone,courses} = req.body;
        const subjectsList = Array.isArray(subjects) ? subjects : subjects ? [subjects] : [];
        const subjectsText = subjectsList.join(", ");

        const coursesList = Array.isArray(courses) ? courses : courses ? [courses] : [];
        const coursesText = coursesList.join(", ");

        let mailOptions = {
            from: email,
            to: 'vstuitions2017@gmail.com',
            subject: `New Student Form Submission`,
            html: `
                <h2>New Student Form Submission</h2>
                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <tr><th>Field</th><th>Details</th></tr>
                    <tr><td><strong>Name</strong></td><td>${firstName} ${lastName}</td></tr>
                    <tr><td><strong>Email</strong></td><td>${email}</td></tr>
                    <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
                    <tr><td><strong>Alternate Phone Number</strong></td><td>${alternatephone}</td></tr>
                    <tr><td><strong>Area</strong></td><td>${area}</td></tr>
                    <tr><td><strong>Grade</strong></td><td>${grade}</td></tr>
                    <tr><td><strong>Board</strong></td><td>${board}</td></tr>
                    <tr><td><strong>Courses</strong></td><td>${coursesText || "Not Provided"}</td></tr>
                    <tr><td><strong>Subjects</strong></td><td>${subjectsText || "Not Provided"}</td></tr>

                    <tr><td><strong>Message</strong></td><td>${message}</td></tr>
                </table>
            `
        };

        await transporter.sendMail(mailOptions);
        req.flash("success", "Email sent successfully!");
        res.redirect("/");
    } catch (error) {
        console.error(error);
        req.flash("error", "Error sending email.");
        res.redirect('/');
    }
});

app.get('/blog', (req, res, next) => {
    try {
        res.render('Blog', { blogPosts });
    } catch (err) {
        next(err);
    }
});

app.get('/contact', (req, res, next) => {
    try {
        res.render('Contact');
    } catch (err) {
        next(err);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
