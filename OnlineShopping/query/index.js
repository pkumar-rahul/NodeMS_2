const express = require("express");
const cors = require("cors");
const app = express();
const amqp = require("amqplib");
const mongoose = require("mongoose");
const ProductsWithReviews = require("./models/productswithreviews.model");
//const isAuthenticated = require("../middleware/auth");
const isAuthenticated = require("publicis_middleware");

app.use(cors());
app.use(express.json());

const products = {};
var connection, channel;

mongoose.connect("mongodb://mongo-service/querydb");
mongoose.connection.once("open",()=>{
  console.log("Connected to reviews database !")
});

async function connectMQ() {
  const amqpServer = "amqp://rabbitmq-service";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ProductQueue");
  await channel.assertQueue("ReviewQueue");
}
// Consume from queue
connectMQ().then(() => {
  channel.consume("ProductQueue", payload => {
    let {newProduct} = JSON.parse(payload.content);
    console.log("Event product received : ", newProduct);
    const newProductWithReviews = new ProductsWithReviews({
      ...newProduct,
      reviews: [],
    });
    newProductWithReviews.save();
    //Giving acknowledgement
    channel.ack(payload);
  }); 
  
  channel.consume("ReviewQueue", async payload => {
    const {newReview} = JSON.parse(payload.content);
    const {reviewId, content, productId} = newReview;
    console.log("Event review received : ", reviewId, content, productId);
    let theProduct = ProductsWithReviews.findOne({productId});
    if (theProduct) {
      await ProductsWithReviews.updateOne(
        {productId} ,
        { $push: { reviews: { reviewId, content } } },
      );
    }
    //Giving acknowledgement
    channel.ack(payload);
  }); 
});

//  Endpoint for client to communicate
app.get("/products", isAuthenticated, async (req, res) => {
  const query = await ProductsWithReviews.find({});
  res.json(query);
});

app.listen(4002, () => {
  console.log("Query Service running at port 4002 !");
});
