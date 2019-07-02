const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");
const Review = require("../models/review");

router.get("/", (req, res) => {
    //Get all campgrounds from DB
    const perPage = 8;
    const pageQuery = parseInt(req.query.page);
    const pageNumber = pageQuery ? pageQuery : 1;
    Campground.find({}).skip(perPage * pageNumber - perPage).limit(perPage).exec((err, allCampgrounds) => {
        Campground.countDocuments().exec((err, count) => {
            if(err) console.log(err);
            else {
                res.render("campgrounds/index", {
                    campgrounds: allCampgrounds,
                    currentPage: pageNumber,
                    pages: Math.ceil(count / perPage),
                    page: "campgrounds"
                })
            }
        })
    })
})

//CREATE - add new campground
router.post("/", middleware.isLoggedIn, (req, res) => {
    //get data from form and add to campgrounds array
    const name = req.body.name;
    const price = req.body.price;
    const image = req.body.image;
    const desc = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    //Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err) console.log(err);
        else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
})

//NEW
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
})

//SHOW - shows more info about one campground
router.get("/:id", (req, res) => {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments likes").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec((err, foundCampground) => {
        if(err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
        else {
            //render show template with that campground
            res.render("campgrounds/show", {
                campground: foundCampground,
                page: "showPage"
            });
        }
    })
})

// LIKE ROUTE
router.post("/:id/like", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some((like) => {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save((err) => {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err) res.redirect("/campgrounds");
            else res.render("campgrounds/edit", {campground: foundCampground});
        })
})

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            updatedCampground.name = req.body.campground.name;
            updatedCampground.description = req.body.campground.description;
            updatedCampground.image = req.body.campground.image;
            updatedCampground.save((err) => {
                if(err) {
                    console.log(err);
                    res.redirect("/campgrounds");
                } else {
                    req.flash("success", "Successfully Updated Your Campground!");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            })
            // req.flash("success", "Successfully Updated Your Campground!");
            // res.redirect("/campgrounds/" + req.params.id);
        }
    })
})

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            //  delete the campground
            campground.remove();
            req.flash("success", "Campground deleted successfully!");
            res.redirect("/campgrounds");
        }
    })
})

module.exports = router;