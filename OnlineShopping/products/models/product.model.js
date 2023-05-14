const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  productId: String,
  title: String,
  price: Number,
  rating: Number,
  likes: Number,
  imageUrl: String,
});

module.exports = mongoose.model("products", productSchema);
