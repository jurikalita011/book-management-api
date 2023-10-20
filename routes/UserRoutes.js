const express = require("express");
const userRouter = express.Router();
const UserModel = require("../model/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

userRouter.post("/register", async (req, res) => {
  const { name, email, pass } = req.body;
  try {
    bcrypt.hash(pass, 7, async (error, hash) => {
      if (error) {
        res.send({
          msg: "Unable to Sign up, Please try again",
          error: error.message,
        });
      } else {
        const user = await UserModel.create({ ...req.body, pass: hash });
        res.send({ msg: "new user has been added", user });
      }
    });
  } catch (error) {
    res.send({
      msg: "Unable to Sign up, Please try again",
      error: error.message,
    });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, pass } = req.body;
  try {
    const user = await UserModel.find({ email });
    if (user.length > 0) {
      bcrypt.compare(pass, user[0].pass, (err, result) => {
        if (err) {
          res.send({ msg: "wrong credentials" });
        } else {
          let token = jwt.sign(
            { userId: user[0]._id, userName: user[0].name },
            "secret3"
          );
          res.send({ msg: "Logged in", token: token });
        }
      });
    } else {
      res.send({ msg: "wrong credentials" });
    }
  } catch (error) {
    res.send({
      msg: "Unable to Sign in, Please try again",
      error: error.message,
    });
  }
});

module.exports = userRouter;
