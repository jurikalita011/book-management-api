const express = require("express");
const userRouter = express.Router();
const UserModel = require("../model/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const BlacklistModel = require("../model/BlackListModel");

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
        res.status(200).send({ msg: "new user has been added", user });
      }
    });
  } catch (error) {
    res.status(500).send({
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
          res.status(200).send({ msg: "Logged in", token: token });
        }
      });
    } else {
      res.send({ msg: "wrong credentials" });
    }
  } catch (error) {
    res.status(500).send({
      msg: "Unable to Sign in, Please try again",
      error: error.message,
    });
  }
});

userRouter.get("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || null;
    if (token) {
      await BlacklistModel.updateMany({}, { $push: { blacklist: [token] } });
      res.status(200).send({ msg: "Logged out Successfully!!" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = userRouter;
