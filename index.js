const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const MongoClient = require('mongodb').MongoClient
const mongodb =  require("mongodb")
const cookieParser = require("cookie-parser");
const {createTokens} = require("./JWT");
const { response, request } = require("express");
const {validateToken} = require("./JWT")
const CORS = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const PORT = 1234

async function createconnections() {

    const MONGO_URL = process.env.MONGO_URL
    const client = new MongoClient(MONGO_URL)
    await client.connect();
    console.log("connected")
    return client;
 }
app.use(express.json())
app.use(cookieParser())
app.get("/",(req,res)=>{
    res.send("hi all")
})
app.use(CORS())




app.get("/getdata" , async(request,response)=>{
    const client = await createconnections()
    const result = await client.db("kepper").collection("user").find({}).toArray()
    response.send(result)
  
})

//registration
app.post("/register" , async (request,response)=>{
    const client= await createconnections()
   
   const {name , email , username , password} = request.body;

   const result1 = await client.db("kepper").collection("user").findOne({username:username})
   if(!result1)
   {
    const salt = await bcrypt.genSalt(10)
    const hashpass =await bcrypt.hash(password,salt)
    
    const result = await client.db("kepper").collection("user").insertOne({name , email , username , hashpass})
    console.log(result)
    response.send("registration successful")
   }
   else{
       response.send("user already exists")
   }

})

//login
app.post("/login" , async(request,response)=>{
    const client= await createconnections()
   
   const{username,password} = request.body;
   
   const result = await client.db("kepper").collection("user").findOne({username:username})
 
   if(!result) 
   {
       response.send("user not exist")
   }
   else
   {
   const hash = result.hashpass
  
   const ispasswordmatch = await bcrypt.compare(password,hash)
 
    if(!ispasswordmatch){
        response.send("username and password not match")
    }
    else{
        const accestoken = createTokens(result)
        console.log(accestoken)
        response.send({messege:"valid logged in",token:accestoken})

        

    }
}
});







//opeartions on data base
app.post("/insertToKepper", async(request,response)=>{
    const client = await createconnections()
    const add_data = request.body
    const result = await client.db("kepper").collection("kepper").insertMany(add_data)
    response.send(result)
})
app.get("/getFromKepper", async(request,response)=>{
    const client = await createconnections()
    const result = await client.db("kepper").collection("kepper").find({}).toArray()
    response.send(result)

})
app.delete("/deleteFromKepper/:id" , async(request,response)=>{
const id = request.params.id
const client = await createconnections()
const user= await client.db("kepper").collection("kepper").deleteOne({_id: new mongodb.ObjectId(id)})
   console.log(id)
   console.log(user)
   response.send(user)


})






app.listen(PORT, () => console.log("server is started in port 1234"));
