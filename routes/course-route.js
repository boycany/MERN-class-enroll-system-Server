const router = require("express").Router();
const Course = require("../models").courseModel;
const { courseValidation } = require("../validation");

router.use((req, res, next) => {
  console.log("A request is coming into course-route.js");
  next();
});

router.get("/", (req, res) => {
  Course.find({})
    .populate("instructor", ["username", "email"]) //response 時會把 instructor 的這兩項資訊 populate 出來
    .then((course) => {
      res.send(course);
    })
    .catch(() => {
      res.status(500).send("Error...cannot get course.");
    });
});

router.get("/:_id", (req, res) => {
  let { _id } = req.params;
  Course.findOne({ _id })
    .populate("instructor", ["email"])
    .then((course) => {
      res.send(course);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post("/", async (req, res) => {
  const { error } = courseValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { title, description, price } = req.body;

  //passport 傳過來的 request 物件當中包含 student
  if (req.user.isStudent()) {
    return res.status(400).send("Only Instrutor can post a new course");
  }

  let newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user._id,
  });

  try {
    const savedCourse = await newCourse.save();
    res.status(200).send({
      msg: "success",
      savedObject: savedCourse,
    });
  } catch (err) {
    res.status(400).send("Cannot save course.");
  }
});

router.patch("/:id", async (req, res) => {
  const { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    return res.json({
      status: "Update failed.",
      message: "Course not found.",
    });
  }

  //只有這堂課的教授或者是 Admin 可以更新課程
  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send("Course updated.");
      })
      .catch((err) => {
        res.send({
          status: "Update failed.",
          message: err,
        });
      });
  } else {
    res.status(403);
    return res.json({
      status: "Update failed.",
      message:
        "Only the instructor of this course or admin can edit this course.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    return res.json({
      status: "Delete failed.",
      message: "Course not found.",
    });
  }

  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.deleteOne({ _id: req.params.id })
      .then(() => {
        res.send("Course deleted.");
      })
      .catch((err) => {
        res.send({
          status: "Delete failed.",
          message: err,
        });
      });
  } else {
    res.status(403);
    return res.json({
      status: "Delete failed.",
      message:
        "Only the instructor of this course or admin can delete this course.",
    });
  }
});

module.exports = router;
