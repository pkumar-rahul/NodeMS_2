const express = require("express");
const axios = require("axios").default;
const { randomBytes } = require("crypto");
const amqp = require("amqplib");
const mongoose = require("mongoose");
const ReviewModel = require("./models/reviews.model");
const isAuthenticated = require("publicis_middleware");

const app = express();
var connection, channel;
app.use(express.json());

mongoose.connect("mongodb://mongo-service/reviewsdb");
mongoose.connection.once("open",()=>{
  console.log("Connected to reviews database !")
});

app.get("/products/:id/reviews", isAuthenticated, async (req, res) => {
    const review = await ReviewModel.find({});
    res.json(review);
});

async function connectMQ() {
    //const amqpServer = "amqp://rabbitmq:5672";
    const amqpServer = "amqp://rabbitmq-service";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ReviewQueue");
}
connectMQ();

app.post("/products/:id/reviews", async (req, res) => {
    const reviewId = randomBytes(4).toString("hex");
    const {content} = req.body;
    
    let productId = req.params.id;
    //Save review to DB
    const newReview = new ReviewModel({reviewId, content, productId});
    await newReview.save();

    channel.sendToQueue("ReviewQueue", Buffer.from(
        JSON.stringify({newReview})
    ));
 
    console.log("Review Event Published : " + newReview);
    res.status(201).send(newReview);
});

app.listen(4001, ()=> {
    console.log("Review service running at port 4001");
});