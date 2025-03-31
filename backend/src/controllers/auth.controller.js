import { generateToken } from '../lib/util.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/coludinary.js';

export const signup = async(req, res) => {
    try {
         const {email, fullname, password} = req.body;
         if(!email || !fullname || !password) {
            return res.status(400).json({message: "All fields are required"});
         }
         if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
         }
         const user = await User.findOne({email});
         if(user) {
            return res.status(400).json({message: "User already exists"});
         }
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         const newUser = await User.create({
            email,
            fullname,
            password: hashedPassword
         });
         if(newUser){
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(201).json({message: "User created successfully", user: newUser});
         }
         else {
            res.status(400).json({message: "Invalid user data"});
         }
    } catch (error) {
        
    }
}

export const login = async(req, res) => {
    try {
        const {email, password} = req.body;
        if(!email ||!password) {
            return res.status(400).json({message: "All fields are required"});
        }
        const user = await User.findOne({email});
        if(user && (await bcrypt.compare(password, user.password))){
            generateToken(user._id, res)
            res.status(200).json({message: "User logged in successfully", user: user});
        }
        else {
            res.status(400).json({message: "Invalid credentials"});
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json({message: "Something went wrong"});
    }
}

export const logout = (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            sameSite:'strict',
            secure: process.env.NODE_ENV!=='development'
        });
        res.status(200).json({message: "User logged out successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(400).json({message: "Something went wrong"});
    }
}

export const updateProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({message: "Avatar is required"});
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Remove the upload_preset parameter since it's causing the error
    const uploadedResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'avatars'
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploadedResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const chakeAuth = (req, res) => {
    try {
        res.status(200).json({message: "User is authenticated", user: req.user});
    } catch (error) {
        console.log(error.message);
        res.status(400).json({message: "Something went wrong"});
    }
}