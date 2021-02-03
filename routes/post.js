const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Post = mongoose.model("Post");
const requireLogin = require("../middleware/requireLogin");

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
  const { title, body } = req.body;
  const file = req.files.file;

  if (!title || !body || !file) {
    res.status(422).json({ error: "Please fill all the fields" });
    return;
  }
  if (req.files === null) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const formData = new FormData();
    formData.append("file", file); 
    formData.append("upload_preset", "insta-clone");
    formData.append("cloud_name", "nova-solutions");

    const postCloud = await axios.post("https://api.cloudinary.com/v1_1/nova-solutions/image/upload", formData);
    const responseCloud = postCloud.data;
    console.log(responseCloud); 

    // console.log(`File name: ${responseCloud.url}`);
    // console.log(`Post Title: ${title}`);
    // console.log(`Post Body: ${body}`);

    req.user.password = undefined;

    const post = new Post({
      title: title,
      body: body,
      photo: responseCloud.url,
      postedBy: req.user,
    });

    const newPost = await post.save();
    res.json({ post: newPost });
  } catch (error) {
    console.log(error);
  }
  return;
});

router.get("/myposts", requireLogin, async (req, res) => {
  try {
    const post = await Post.find({ postedBy: req.user._id }).populate("postedBy", "_id name");
    res.json({ post: post });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
