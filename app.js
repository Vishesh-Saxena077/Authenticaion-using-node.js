//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const md5 = require('md5');

const port = 3000;
const app = express();


mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// ("collection", innerentries)
const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

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
            res.redirect("/login");
        } else {
            const newUser = new User({
                email: username,
                password: md5(password),
            });

            await newUser.save().then(() => {
                console.log("User registered successfully.");
                res.render("secrets");
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});


// Logging in the credentials
app.post("/login", async(req, res) => {
    const { username, password } = req.body;

    try {
        const foundUser = await User.findOne({ email: username });

        if (foundUser) {
            if (foundUser.password === md5(password)) { // checking hashed passwords
                res.render("secrets");
            }
        } else {
            console.log("Wrong Credentials.");
            alert("Wrong Credentials.");
            res.redirect("/login");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});



app.listen(port, () => {
    console.log(`The App is Listing on PORT = ${port}`);
});