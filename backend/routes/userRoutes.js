import express from "express";
import {
  deleteAccount,
  updateUser,
  getUser,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/getUser", getUser);
router.patch("/updateUser", updateUser);
router.patch("/changePassword", changePassword);
router.delete("/deleteAccount", deleteAccount);

export default router;
