require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

let users = [];
let reports = [];

// LOGIN
app.post('/login', (req,res)=>{
  const {username,password} = req.body;
  const user = users.find(u=>u.username===username && u.password===password);
  if(!user) return res.status(401).json({message:"Invalid credentials"});
  res.json({message:"Login success"});
});

// SIGNUP
app.post('/signup', (req,res)=>{
  const {username,email,phone,password,otp} = req.body;
  if(otp!=="1234") return res.status(400).json({message:"Invalid OTP"});
  users.push({username,email,phone,password});
  res.json({message:"Signup success"});
});

// SEND OTP (mock)
app.post('/send-otp',(req,res)=>{
  res.json({otp:"1234"});
});

// URL SCAN
app.post('/scan-url', async (req,res)=>{
  const {url} = req.body;
  try{
    const response = await fetch(
      `https://api.apivoid.com/v2/url-reputation?api_key=${process.env.URL_API_KEY}`,
      {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({url})
      }
    );
    const data = await response.json();
    const score = data?.data?.risk_score?.result || 0;
    let status = "safe";
    if(score>=70) status="danger";
    else if(score>=30) status="warning";
    res.json({status,score});
  }catch{
    res.status(500).json({status:"error"});
  }
});

// REPORT
app.post('/report',(req,res)=>{
  reports.push(req.body);
  res.json({message:"Report saved"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Server running"));
