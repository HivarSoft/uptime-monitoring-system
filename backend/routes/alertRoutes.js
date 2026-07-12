import express from "express";
import {
  getAlertChannels,
  getAlertChannelById,
  createAlertChannel,
  updateAlertChannel,
  deleteAlertChannel,
  testAlertChannel,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/",          getAlertChannels);
router.get("/:id",       getAlertChannelById);
router.post("/",         createAlertChannel);
router.patch("/:id",     updateAlertChannel);
router.delete("/:id",    deleteAlertChannel);
router.post("/:id/test", testAlertChannel);

export default router;
