import express from "express";
import {
  createProject, createService, updateService,
  deleteProject, deleteService,
  getAllProjects, getAllServices, getServiceById,
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/getAllProjects",                  getAllProjects);
router.post("/createProject",                 createProject);
router.post("/createService",                 createService);
router.post("/getAllServices",                getAllServices);
router.get("/getService/:id",                 getServiceById);
router.patch("/updateService/:serviceId",     updateService);
router.delete("/deleteService/:serviceId/:projectId", deleteService);
router.delete("/deleteProject/:projectId",    deleteProject);

export default router;
