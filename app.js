const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { MONGO_URI } = require("./keys");
const fileUpload = require("express-fileupload"); 

const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", () => {
  console.log("Conected @ Mongoose OwO");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

require("./models/user");
require("./models/post");

//middleware, modify request before endpoinst are reached
app.use(express.json());
app.use(fileUpload());

//Routes
app.use(require("./routes/auth"));
app.use(require("./routes/post"));

app.listen(PORT, (req, res) => {
  console.log(`Listeing @ port ${PORT}`);
});
