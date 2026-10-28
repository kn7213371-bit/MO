import express from "express";
import { connectDB } from "./connectDB.js";
const app= express();


app.use((req,res,next)=>{
    console.log(new Date().toLocaleString(),req.method,req.url);
    next();
});

const client=await connectDB()
const db=client.db("sample_mflix");

app.get("/movies/rating",async(req,res)=>{
const movies= db.collection("movies");

const result=await movies.find({
    "imdb.rating":{$gt:8.5},
    "imdb.votes":{$gt:100000},
    "awards.wins":{$gte:5},
}
).project({
    title:1,
    year:1,
    "imdb.rating":1,
    "awards.wins":1,
    _id:0}).toArray();

res.status(200).json({
    data:result
})
});

app.get("/theaters",async(req,res)=>{
    const theaters= db.collection("theaters");

    const result =await theaters.find({
        "location.address.state":"CA",
        $or:[
             { "location.address.city": "San Francisco" },
             { "location.address.city": "Los Angeles" }
        ],
    }).project({
        theaterId:1,
        "location.address.street1":1, 
        "location.address.city":1,  
        _id:0
    }).toArray();

    res.status(200).json({
        data:result
    })
})



app.get("/aggregate",async(req,res)=>{
    const movies=db.collection("movies");

    const data=await movies.aggregate([
        {
            $match:{
            title:"The Matrix",
            year:1999 }
        },
        {
        $lookup:{
            from:"comments",
            localField:"_id",
            foreignField:"movie_id",
            as:"movie_comments"
        }
    }]).toArray()

    res.status(200).json({
        data:data
    })
});

app.get("/pipeline",async(req,res)=>{
    const movies = db.collection("movies");

    const data=await movies.aggregate([{$match:{
        genres:"Sci-Fi",
        "imdb.rating":{$gt:8.5}
    }},{
        $lookup:{
            from:"comments",
            let:{movieId:"$_id"},
            pipeline:[
            {$match:{$expr:{$eq:["$movie_id","$$movieId"]}}},
            {$sort:{date:-1}},
            {$limit:3},
            {$project:{
                name:1,
                text:1, 
                _id:0,
                date:1
            }}
        ],
        as:"recent comments"
        }
    }]).toArray()

    res.status(200).json({
        data:data
    })
})




app.use((err,req,res,next)=>{
    console.log("err :" , err);
    res.status(500).json({ error: "something went wrong" });

})
app.listen(3000,()=>{
    console.log("Server on PORT : 3000");
    
})