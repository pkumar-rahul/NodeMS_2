const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Users = require("./models/user.model");

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://mongo-service/authdb");
mongoose.connection.once("open",()=>{
  console.log("Connected to auth database !")
});

//Register
app.post("/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await Users.findOne({ email });
    if (userExists) {
      return res.json({ message: "User already existing !" });
    } else {
      const newUser = new Users({ name, email, password });
      newUser.save();
      return res.json(newUser);
    }
});

//Sign
app.post("/auth/signin", async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist !" });
    } else {
      if (password !== user.password) {
        return res.json({ message: "Password Incorrect !" });
      }
      // sign the token (generate) with secret key
      const payload = { email, name: user.name };
      jwt.sign({ expiresIn: "2Days", data: payload }, "OurSecretKey", (err, token) => {
        if (err) console.log(err);
        else return res.json({ token });
      });
    }
});

//Verify
app.post("/auth/verify", async (req, res) => {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, "OurSecretKey", (err, user) => {
      if (err) {
        return res.json({ message: err });
      } else {
        res.json({ message: "Authenticated !", user });
      }
    });
});

app.listen(4003, () => {
    console.log("Auth-Service running at port 4003 !");
});
