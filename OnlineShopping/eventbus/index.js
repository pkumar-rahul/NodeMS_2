const express = require("express");
const axios = require("axios").default;
const { randomBytes } = require("crypto");

const app = express();
app.use(express.json());

app.post("/events", (req, res) => {
    //notify the listeners
    const event = req.body;
    axios
      .post("http://localhost:4000/events", event)
      .catch(err => console.log(err));
  
    axios
      .post("http://localhost:4001/events", event)
      .catch(err => console.log(err));
  
    axios
      .post("http://localhost:4002/events", event)
      .catch(err => console.log(err));  
  
    res.send({ status: "OK" });
  });

app.post("/events", (req, res) => {
    console.log("Received Event : ", req.body.type);
    res.send({});
});

app.listen(4005, ()=> {
    console.log("EventBus listening at port 4005");
});