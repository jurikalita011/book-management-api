const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    jwt.verify(token, "secret3", (err, decoded) => {
      if (decoded) {
        // req.body.user = decoded.userId;
        req.userId = decoded.userId;
        req.name = decoded.userName;
        next();
      } else {
        res.send({ msg: "Please log in" });
      }
    });
  } else {
    res.send({ msg: "Please log in" });
  }
};

module.exports = authMiddleware;
