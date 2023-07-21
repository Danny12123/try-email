const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Token = require('../models/token')
const sendEmail = require("../utils/sendEmail");

//REGISTER
router.post("/signup", async (req, res) => {
    try {
        let useremail = await User.findOne({ email: req.body.email });
        if (useremail) return res.status(409).send({message: "User with given email already Exist!"});

     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(req.body.password, salt);

     const newUser = new User({
       username: req.body.username,
       email: req.body.email,
       password: hashedPassword,
     });

     const user = await newUser.save();

     const token = await new Token({
       userId: user._id,
       token: crypto.randomBytes(32).toString("hex"),
     }).save();
     const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
     await sendEmail(user.email, "Verify Email", url);

     res.status(200).send({message: "An Email has been sent to your account please verify"});
    } catch (err) {
         res.status(500).send(err.message);
    }
    
})

router.get("/:id/verify/:token/", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send( {message: "Invalid link"});

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({message: "Invalid link"});

    await User.updateOne({ _id: user._id, verified: true });
    await token.remove();

    res.status(200).send({message: "Email verified successfully" });
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"});
  }
});


router.post("/signin", async (req, res)=> {
    try{
      const user = await User.findOne({ email: req.body.email });
      !user && res.status(404).send({ message: "User not found" });

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      !validPassword && res.status(400).send({ message: "Wrong password" });

       if (!user.verified) {
         let token = await Token.findOne({ userId: user._id });
         if (!token) {
           token = await new Token({
             userId: user._id,
             token: crypto.randomBytes(32).toString("hex"),
           }).save();
           const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;

           await sendEmail(user.email, "Verify Email", url);
         }

         return res
           .status(200)
           .send({message: "An Email has been sent to your account please verify"} );
       }

       const token = user.generateAuthToken();  data: token,
      res.status(200).send(user);
    }catch(err){
    res.status(500).json(err)
  }
})



module.exports = router;