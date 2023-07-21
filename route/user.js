const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

//updateUser
router.put("/updateUser/:id", async(req, res)=> {
  if (req.body.userId === req.params.id) {
    if(req.body.password) {
     try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
      try {
        const user = await User.findByIdAndUpdate(req.params.id, {
          $set: req.body,
        });
         res.status(200).send({message: "Account has been updated"});
      } catch (err) {
        return res.status(500).json(err);
      }
    }
  }else {
    return res
      .status(403)
      .send({ message: "You can update only your account" });
  }
});

//deleteUser
router.delete("/:id", async(req, res)=> {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
      try {
        const user = await User.findByIdAndDelete(req.params.id);
         res.status(200).send({message: "Account has been deleted"});
      } catch (err) {
        return res.status(500).json(err);
      }
  }else {
    return res
      .status(403)
      .send({ message: "You can delete only your account" });
  }
});

//get a user
router.get("/:id", async (req, res)=>{
  try {
    const user =  await User.findById(req.params.id)
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req,res)=> {
  if(req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if(!user.followers.includes(req.body.userId)){
        await user.updateOne({$push: {followers: req.body.userId}});
        await currentUser.updateOne({ $push: { followings: req.params.userId } });

        res.status(200).send({message: "User has been followed"})
      }else {
        return res.status(403).send({ message: "You already follow this user" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }else {
     return res
       .status(403)
       .send({ message: "You can't follow yourself" });
  }
})
//Unfollow a user
router.put("/:id/unfollow", async (req,res)=> {
  if(req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if(user.followers.includes(req.body.userId)){
        await user.updateOne({$pull: {followers: req.body.userId}});
        await currentUser.updateOne({ $pull: { followings: req.params.userId } });

        res.status(200).send({message: "User has been unfollowed"})
      }else {
        return res.status(403).send({ message: "You already unfollow this user" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }else {
     return res
       .status(403)
       .send({ message: "You can't unfollow yourself" });
  }
})



module.exports = router