const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const requireLogin = require("../middleware/requireLogin");

const User = mongoose.model("User");

router.get("/", (req, res) => {
  res.send("hello");
});

router.get("/protected", requireLogin, (req, res) => {
  res.send("ayee");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    if (!email || !password || !username || !name) {
      res.status(422).json({ error: "Please fill all the fields" });
      return;
    }

    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      res.status(422).json({ error: "Invalid Email." });
      return;
    }

    const checkUser = await User.findOne({ email: email });
    if (checkUser) {
      res.status(422).json({
        error: "There is an account associated with this email already",
      });
      return;
    } else {
      const passHashed = await bcrypt.hash(password, 16);
      console.log(passHashed);
      const user = new User({
        email,
        username,
        name,
        password: passHashed,
      });

      const saveUser = await user.save();
      if (saveUser)
        res.json({ message: `User @${username} created successfully ` });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    console.log(email);
    console.log(password);
    if (!email || !password) {
      res.status(422).json({ error: "Please, provide an email & password :)" });
      return;
    }

    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      res.status(422).json({ error: "Invalid email or password" });
      return;
    }
    const checkPassword = await bcrypt.compare(password, findUser.password);

    if (checkPassword) {
      //create user token
      const token = jwt.sign({ _id: findUser._id }, JWT_SECRET);
      const { _id, username, name, email } = findUser;

      res.json({ token: token, user: { _id, username, name, email } });
      //res.status(422).json({ message: "Logged in successfully!"})
      return;
    } else {
      res.status(422).json({ error: "Invalid email or password" });
      return;
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
