const express = require("express");
const app = express();
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();

const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;

const passport = require("passport");
require("./config/passport")(passport);

const cors = require("cors")

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to mongodb.");
  })
  .catch((e) => {
    console.log(e);
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.use("/api/user", authRoute);
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(process.env.SERVER_PORT || 8000, () => {
  console.log(`Server is running on ${process.env.SERVER_PORT || 8000}.`);
});
