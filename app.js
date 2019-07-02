const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      passport = require("passport"),
      methodOverride = require("method-override"),
      localStrategy = require("passport-local"),
      User = require("./models/user"),
      flash = require("connect-flash");
    //   seedDB = require("./seeds.js");

//requiring routes
const commentRoutes = require("./routes/comments"),
      campgroundRoutes = require("./routes/campgrounds"),
      indexRoutes = require("./routes/index"),
      reviewRoutes = require("./routes/reviews");

const databaseURL = process.env.databaseURL || "mongodb://localhost/yelp_camp_v10";
mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to db!");
}).catch(err => {
    console.log("ERROR: " + err.message);
})
app.locals.moment = require('moment');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seed the database
// seedDB();


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This is the secret page",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


const port = process.env.PORT || 8000;
app.listen(port, process.env.IP, () => {
    console.log("The YelpCamp Server Has started!");
})