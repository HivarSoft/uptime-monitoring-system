import express from "express";
import {
  deleteAccount,
  updateUser,
  getUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/getUser",       getUser);
router.patch("/updateUser",  updateUser);
router.delete("/deleteAccount", deleteAccount);

export default router;
