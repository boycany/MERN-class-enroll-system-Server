const router = require("express").Router()
const { registerValidation } = require('../validation')
const { loginValidation } = require('../validation')
const User = require("../models").userModel


router.use((req, res, next)=>{
    console.log("A request is coming in to auth.js");
    next()
})

/*   url: localhost/api/user/test/API   */
router.get("/testAPI", (req, res)=>{
    const msgObj = {
        message: "Test API is working."
    }
    return res.json(msgObj)
})

// 註冊
router.post("/register", async (req, res)=>{
    console.log(">>> Register");
   
    //check the validation of data
    const { error } = registerValidation(req.body)
    
    if(error) {
        return res.status(400).send(error.details[0].message)
    }

    //check if the user exists (Mongoose 操作資料庫的指令是回傳 promise 所以要加 await)
    const emailExist = await User.findOne({ email: req.body.email })
    if(emailExist) 
        return res.status(400).send("Email has already been registered.")

    //register the user
    const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        role: req.body.role
    })

    //(Mongoose 操作資料庫的指令是回傳 promise 所以要加 await)
    try {
        const savedUser = await newUser.save()
        res.status(200).send({
            msg: "success",
            savedObject: savedUser
        })    
    }catch(err){
        res.status(400).send("User not saved.")
    }
})

module.exports = router