const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewsSchema = new Schema({
    reviewId: String,
    content: String,
    productId: String
  });

module.exports = mongoose.model("reviews", reviewsSchema);