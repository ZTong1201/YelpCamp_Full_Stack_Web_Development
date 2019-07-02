const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

//INDEX
router.get("/", (req, res) => {
    res.render("landing");
})

//show register form
router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
})

//handle sign up logic
router.post("/register", (req, res) => {
    const newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Successfully Signed Up! Nice to meet you " + user.username);
            res.redirect("/campgrounds");
        })
    })
})

//show login form
router.get("/login", (req, res) => {
    res.render("login", {page: "login"});
})

//handle login logic
router.post("/login", passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), (req, res) => {
    req.flash("success", "Welcome Back! " + req.body.username);
})

//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "See you later!");
    res.redirect("/campgrounds");
})

module.exports = router;