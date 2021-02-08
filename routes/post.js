const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Post = mongoose.model("Post");
const requireLogin = require("../middleware/requireLogin");

const { cloudinary } = require("../keys");
const axios = require("axios");

router.get("/allpost", async (req, res) => {
  try {
    const allPosts = await Post.find().populate("postedBy", "_id username");
    res.json({ posts: allPosts });
  } catch (error) {
    console.log(error);
  }
});

router.post("/createpost", requireLogin, async (req, res) => {
  const { title, body, image } = req.body;

  console.log(title);
  console.log(body);
  // console.log(image);

  if (!title || !body || !image) {
    res.status(422).json({ error: "Please fill all the fields" });
    return;
  }

  let uploadedPhoto = "";
  try {
    const uploadedResponse = await cloudinary.uploader.upload(image, {
      upload_preset: "mern-instagram",
    });
    console.log(uploadedResponse);
    // res.status(422).json({ msg: "Uploaded image!! OwO" });
    uploadedPhoto = uploadedResponse;
  } catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }

  req.user.password = undefined;

  const post = new Post({
    title: title,
    body: body,
    photo: uploadedPhoto.secure_url,
    postedBy: req.user,
  });

  const newPost = await post.save();
  res.json({ post: newPost });
  return;
});

router.get("/myposts", requireLogin, async (req, res) => {
  try {
    const post = await Post.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "_id username"
    );
    res.json({ post: post });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
