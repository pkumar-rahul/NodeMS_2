const express = require("express");
const axios = require("axios").default;
const { randomBytes } = require("crypto");
const amqp = require("amqplib");
const Product = require("./models/product.model");
const mongoose = require("mongoose");
//const isAuthenticated = require("../middleware/auth");
const isAuthenticated = require("publicis_middleware");

const app = express();
var connection, channel;

mongoose.connect("mongodb://mongo-service/productsdb");
mongoose.connection.once("open",()=>{
  console.log("Connected to product database !")
});

app.use(express.json());

app.get("/products", async(req, res) => {
    const product = await Product.find({});
    res.json(product);
});

async function connectMQ() {
    //const amqpServer = "amqp://localhost";
    const amqpServer = "amqp://rabbitmq-service";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ProductQueue");
}
connectMQ();

app.post("/products/create", isAuthenticated, async (req, res) => {
    const productId = randomBytes(4).toString("hex");
    const {title, price, likes, rating, imageUrl } = req.body;

    //Save products to DB
    const newProduct = new Product({ productId, title, price, rating, likes, imageUrl });
    newProduct.save();
    //Notify event via Rabbit (publishing)
    channel.sendToQueue("ProductQueue", Buffer.from(
        JSON.stringify({newProduct})
    ));

    res.status(201).send(newProduct);
});

app.listen(4000, ()=> {
    console.log("Product service running at port 4000");
});