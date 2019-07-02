const mongoose = require("mongoose");
const comment = require('./comment');

const campgroundSchema = mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
})

campgroundSchema.pre('deleteOne', async function() {
	await comment.deleteMany({
		_id: {
			$in: this.comments
		}
    });
    await review.deleteMany({
        _id: {
            $in: this.reviews
        }
    })
});

module.exports = mongoose.model("Campground", campgroundSchema);