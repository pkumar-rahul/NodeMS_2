const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductWithReviewsSchema = new Schema({
  productId: String,
  title: String,
  price: Number,
  rating: Number,
  likes: Number,
  imageUrl: String,
  reviews: [],
});

module.exports = mongoose.model("Productswithreviews",ProductWithReviewsSchema,);
