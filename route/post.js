const Post = require("../models/Post");
const User = require("../models/User");

const router = require("express").Router();


// Create post
 router.post("/", async (req,res)=> {
    const newPost = new Post(req.body)
    try{
        const savedPost = await newPost.save();
        res.status(200).send({message: "Post has been created successfully",savedPost});
    }catch(err){
        res.status(500).json(err)
    }
})
// update post
router.put("/:id", async (req, res)=> {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({$set:req.body});
            res.status(200).json("Your post has been updated")
        } else {
          res.status(403).json("You can update only your post");
        }
    } catch (err) {
        res.status(500).json(err)
    }
    
});
// delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Your post has been deleted");
    } else {
      res.status(403).json("You can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like a post
router.put("/:id/like", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push: {likes: req.body.userId}})
            res.status(200).json("The post has been liked")
        }else {
            await post.updateOne({$pull:{likes:req.body.userId}})
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err)
    } 
    
})


// get post
// router.get("/userpost/:id", async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     res.status(200).json(post);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
// get timeline post
router.get("/timeline/:userId", async (req, res)=> {
    
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({userId: currentUser._id});
        const friendPost = await Promise.all(
            currentUser.followings.map((friendId)=>{
               return Post.find({userId: friendId});
            })
        );
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept"
        );
        res.status(200).json(userPosts.concat(...friendPost));
    } catch (err) {
        res.status(500).json(err);
    }
})
//get user all post 
router.get("/userpost/:username", async (req, res)=> {
    
    try {
        const user = await User.findOne({username:req.params.username});
        const post = await Post.find({userId: user._id});
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept"
        );
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
})
//get all post
router.get("/", async(req,res)=> {
     try {
       const posts = await Post.aggregate([{$sample: {
         size: 60
       }}]);
       res.setHeader("Access-Control-Allow-Origin", "*");
       res.setHeader("Access-Control-Allow-Methods", "GET");
       res.setHeader(
         "Access-Control-Allow-Headers",
         "Origin, X-Requested-With, Content-Type, Accept"
       );
       res.status(200).json(posts);
     } catch (err) {
       console.error(err.message);
       res.status(500).send("Server Error");
     }
});


module.exports = router;
