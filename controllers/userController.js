const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const key = require("../env");

exports.get_all = (req,res,next)=>
{
	console.log(process.env.JWT_KEY)
	User.find()
	.exec()
	.then(docs=>{
		res.status(200).json(docs);
	})
	.catch(err=>{
		console.log(err);
		res.status(500).json({
			error:err
		});
	});
};

exports.sign_up = (req,res,next)=>
{
	User.find({email: req.body.email})
	.exec()
	.then(user =>{
		if(user.length >= 1){
			return res.status(409).json({
				message:"User Exist!"
			});
		}else{
			bcrypt.hash(req.body.password,10,(err,hash)=>
			{
				if(err){
					return res.status(500).json({
						error: err
					});
				}else{
					const user = new User({
						_id: new mongoose.Types.ObjectId(),
						email: req.body.email,
						password: hash,
						typeOfUser: req.body.typeOfUser
					});
					user.save()
					.then(result=>{
						console.log(result);
						res.status(201).json({
							message:"User Created!"});
					})
					.catch(err=>
					{
						console.log(err);
						res.status(500).json({error:err});
					});
				}
			});
		}
	});
};

exports.login = (req,res,next)=>
{
	console.log(key.env.JWT_KEY);
	User.find({email:req.body.email})
	.exec()
	.then(user =>{
		if(user.length<1){
			return res.status(401).json({
				message:"Auth Failed"
			});
		}
		if(user[0].typeOfUser != req.body.typeOfUser)
			throw "User Invalid!"
		bcrypt.compare(req.body.password,user[0].password,(err,result)=>
		{
			if(err){
				return res.status(401).json({
					message: "Auth Failed"
				});
			}
			if(result){
				const token = jwt.sign(
				{
					email: user[0].email,
					userId: user[0]._id
				},
				key.env.JWT_KEY,
				{
					expiresIn:"1h"
				}
				);
				return res.status(200).json({
					message:"Auth Successful",
					token: token
				});
			}
			res.status(401).json({
				message:"Auth Failed!"
			});
		});
	})
	.catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};





