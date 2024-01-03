//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 5;
// const md5 = require('md5');
// const encrypt = require('mongoose-encryption');

const port = 3000;
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "our little",
    resave: false,
    saveUninitialized: false
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// ("collection name", innerentries)
const User = new mongoose.model("User", userSchema);



app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

// Registering the data
app.post("/register", async(req, res) => {

    const { username, password } = req.body;
    try {
        const foundUser = await User.findOne({ email: username });

        if (foundUser) {
            console.log("User already exists.");
            return res.redirect("/login");
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            email: username,
            password: hashedPassword, // Storing the hashed password
        });

        await newUser.save().then(() => {
            console.log(`${username} User registered successfully.`);
            rq.session.userName = user_name;
            return res.redirect("secrets");
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Logging in the credentials
app.post("/login", async(req, res) => {
    const { username, password } = req.body;
    try {
        const foundUser = await User.findOne({ email: username });

        if (foundUser) {
            // Comparing hashed passwords using bcrypt
            const isPasswordValid = await bcrypt.compare(password, foundUser.password);

            if (isPasswordValid) {
                req.session.userName = foundUser.username;
                res.redirect("secrets");
            } else {
                console.log("Wrong Credentials.");
                res.status(401).send("Wrong Credentials."); // Unauthorized status for wrong password
            }
        } else {
            console.log("User not found.");
            res.status(404).send("User not found."); // Not found status for non-existing user
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/secrets', function(req, res) {
    if (req.session.userName) {
        return res.redirect('secrets');
    } else {
        return res.redirect('login');
    }
});

app.post('/logout', () => {
    // clear secretJWT from session

});


app.listen(port, () => {
    console.log(`The App is Listing on PORT = ${port}`);
});