//all the middleware goes here
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const Review = require("../models/review");

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if(req.isAuthenticated()) {
        //does user own the campground?
        Campground.findOne({slug: req.params.slug}, (err, foundCampground) => {
            if(err || !foundCampground) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            }
            else {
                //does user own the campground?
                if(foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that. Please log in first");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()) {
        //does user own the campground?
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            }
            else {
                //does user own the campground?
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that. Please log in first");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkReviewOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, (err, foundReview) => {
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkReviewExistence = (req, res, next) => {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                var foundUserReview = foundCampground.reviews.some((review) =>
                 {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                next();
            }
        })
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
}

module.exports = middlewareObj;