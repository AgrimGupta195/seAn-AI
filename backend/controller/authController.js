import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import generateToken from '../lib/utils.js';
function generateRandomString(length = 15) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
export const signup = async (req, res) => {
    const { fullName, email, password} = req.body;
    try {
        if (!password || !fullName || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User Already Exist" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let key = generateRandomString();
let existKey = await User.findOne({ key });

while (existKey) {
  key = generateRandomString();
  existKey = await User.findOne({ key });
}
        const newUser = new User({
            fullName,
            password: hashedPassword,
            email,
            key
        });
        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
            });
        } else {
            res.status(400).json({ message: "Invalid User Data" });
        }
        console.log("user created");
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            const isPassword = await bcrypt.compare(password, user.password);
            if (!isPassword) {
                return res.status(400).json({ message: "Invalid Credentials" });
            }
            generateToken(user._id, res);
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
            });
        } else {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        console.log("login successfull");
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "logout Successfully" });
    } catch (error) {
        console.log("error in logout controller");
        res.status(500).json({ message: "Internal Server error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
};