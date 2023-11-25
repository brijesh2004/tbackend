const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config(); 
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    tokens:[
        {
            token:{
                type:String ,
                required:true
            }
        }
    ]
})

userSchema.pre('save' , async function(next) {
    
    if(this.isModified('password')){
   
       this.password =await bcrypt.hash(this.password , 12);
     
    }
    next();
 })

userSchema.methods.generateAutoToken = async function(){
    try{
    let token = jwt.sign({_id: this._id} , process.env.secret_token);
    this.tokens = this.tokens.concat({token:token});
    await this.save();
    return token;
    }
    catch(err){
        console.log(err);
    }
   }


const user = mongoose.model('user',userSchema);

module.exports = user;