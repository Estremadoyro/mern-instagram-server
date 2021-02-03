const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
  //401 --> Unauthorized
    if (!authorization) {
      res.status(401).json({ error: "You must be logged in" });
      return;
    }
    const token = await authorization.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET, (err, verifiedJwt) => {
      if (err) {
        res.status(401).json({ error: "You must be logged in ERRoR" });
        return;
      }

      const { _id } = verifiedJwt;
      User.findById(_id).then((userdata) => {
        req.user = userdata;
        //console.log(req.user);
        //console.log(verifiedJwt);
        next();
      });

      // const findVerifiedUser = await User.findById(_id);
      // req.user = findVerifiedUser;
      // next();
      //res.send(verifiedJwt);
    });
  } catch (error) {
    console.log(error);
  }
};
