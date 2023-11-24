const mongoose  = require("mongoose");
require('dotenv').config(); 

// console.log(process.env.mongo_url);
mongoose.connect(process.env.mongo_url,{
    useNewUrlParser:true
}).then(()=>{
    console.log("Connection Successfull")
}).catch(()=>{
    console.log("No connection")
})

