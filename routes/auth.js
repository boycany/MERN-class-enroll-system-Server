const router = require("express").Router();
const User = require("../models").userModel;
const { registerValidation, loginValidation } = require("../validation");

const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("A request is coming in to auth.js");
  next();
});

/*   url: localhost/api/user/test/API   */
router.get("/testAPI", (req, res) => {
  const msgObj = {
    message: "Test API is working.",
  };
  return res.json(msgObj);
});

// 註冊
router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { email, username, password, role } = req.body;

  //check if the user exists (Mongoose 操作資料庫的指令是回傳 promise 所以要加 await)
  const emailExist = await User.findOne({ email });
  if (emailExist)
    return res.status(400).send("Email has already been registered.");

  //register the user
  const newUser = new User({
    email,
    username,
    password,
    role,
  });

  //(Mongoose 操作資料庫的指令是回傳 promise 所以要加 await)
  try {
    const savedUser = await newUser.save();
    res.status(200).send({
      msg: "success",
      savedObject: savedUser,
    });
  } catch (err) {
    res.status(400).send("User not saved.");
  }
});

router.post("/login", (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.status(400).send(err);
    }
    if (!user) {
      res.status(401).send("User not found");
    } else {
      //userSchema 裡設定的 Method
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) return res.status(400).send(err);
        if (isMatch) {
          const tokenObj = { _id: user.id, email: user.email };
          const token = jwt.sign(tokenObj, process.env.PASSPORT_SECRET);
          res.send({ success: true, token: "JWT " + token, user });
        } else {
          res.status(401).send("Wrong Password.");
        }
      });
    }
  });
});

module.exports = router;
