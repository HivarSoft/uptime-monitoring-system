import { generateToken } from "../helpers/authHelper.js";
import User from "./../models/User.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExist = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Failed to create account",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(
      user._id,
      user.email,
      user.firstName,
      user.lastName
    );

    return res.status(200).json({
      success: true,
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imgUrl: user.imgUrl,
        id: user._id,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const checkLogin = (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({
        success: true,
        message: "User is logged in",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
