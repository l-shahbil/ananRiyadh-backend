import express from 'express'
import {successResponse} from '../src/shared/utils/response.js'


const app = express();

app.use(express.json())


//helath check
app.get("/health",(_req,res)=>{
    res.status(200).json(successResponse(null,"Server running"))
});

//Handler 
app.use((_req,res)=>{
    res.status(404).json({success:false,message:"Route not found"})
})

export default app;
