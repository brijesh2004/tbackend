const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs")
const app = express();

const {user ,Post , Comment} = require("./model/register");

require("./db/conn");

app.use(express.json());

app.use(
    cors({
        credentials:true,
        origin:['https://taskfrontedn.onrender.com'],
        methods:["POST", "GET","UPDATE"],
        allowedHeaders:["Content-Type" , "Authorization"]
    })
)

app.get("/" , (req, res)=>{
    res.send("Hello World");
})

app.post("/signup" , async (req, res)=>{
    res.header('Access-Control-Allow-Origin', `https://taskfrontedn.onrender.com`);
    try{
        const body = req.body;
        const username = body.user.username;
        const email = body.user.email;
        const password = body.user.password;
     const userExist = await user.findOne({username});
     const userExist1 = await user.findOne({email});
      if(userExist || userExist1){
        return res.status(409).json({message:"Username already exists"});
      }
      const newuser = new user({
        username , email , password
      })
      await newuser.save();
     return res.status(201).json({ message: "User Registerd Successfully" });
     }
    catch(error){
        console.log(err);
  return res.status(500).json({ error });
    }

})


app.post("/login" , async (req,res)=>{
    res.header('Access-Control-Allow-Origin', `https://taskfrontedn.onrender.com`);
    try{
    const {emailoruser, password} = req.body;
    
   
    let findUser = await user.findOne({username:emailoruser});
    const findUser1 = await user.findOne({email:emailoruser});
    

  
    if(!findUser && !findUser1){
       return res.status(501).json({ error:"User Not found" });
    }
     if(!findUser){
        findUser = findUser1;
     }
    

    const passwordMatch =await bcrypt.compare(password , findUser.password);

    if(passwordMatch){
        const token = await findUser.generateAutoToken();
  
        // cookie store  
        res.cookie("jwttoken", token, {
          expires: new Date(Date.now() + 25892000),
          httpOnly: true
        });
       return res.status(200).json({ message: "user signin Successfully" });
    }
    else{
       return res.status(502).json({ error:"Wrong User credentials" });
    }
    }
    catch(error){
        console.log(error);
       return res.status(500).json({ error });
    }
})


app.post("/forgetpassword" , async (req, res)=>{
    try{
       const {email ,password} = req.body;
       const findUser1 = await user.findOne({email:email});
       if(!findUser1){
        return res.status(501).json({ error:"User Not found" });
       }
       findUser1.password = password;
       findUser1.save();
       return res.status(200).json({ message:"Password reset" });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({ error });
    }
})




// Create a Post
app.post('/posts', async (req, res) => {
    const { content, userId } = req.body;
    try {
        const newPost = new Post({ content, creator: userId });
        await newPost.save();
        await user.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Get all Posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('creator', 'username').populate('comments');
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update a Post
app.patch('/posts/:id', async (req, res) => {
    const { content } = req.body;
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { content }, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a Post
app.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Like or Unlike a Post
app.post('/posts/:id/like', async (req, res) => {
    const { userId } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        const index = post.likes.indexOf(userId);
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1); // Unlike the post if already liked
        }
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Comment on a Post
app.post('/posts/:id/comment', async (req, res) => {
    const { content, userId } = req.body;
    try {
        const newComment = new Comment({ content, createdBy: userId, postId: req.params.id });
        await newComment.save();
        await Post.findByIdAndUpdate(req.params.id, { $push: { comments: newComment._id } });
        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(8000 , ()=>{
    console.log("Server listening on 8000");
})