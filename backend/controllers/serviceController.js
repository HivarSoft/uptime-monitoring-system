import { initializeService } from "../loggService/loggService.js";
import MonitorLog from "../models/MonitorLog.js";
import Project from "../models/Project.js";
import Service from "../models/Service.js";
import User from "./../models/User.js";

export const getAllProjects = async (req, res) => {
  try {
    const id = req.user.id;
    const projects = await User.findById(id)
      .select("projects")
      .populate({
        path: "projects",
        populate: { path: "services", select: "serviceName currentStatus" },
      });

    res.json({ success: true, user: projects });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const project = new Project({
      name: name.trim(),
      services: [],
      userId: user._id,
    });
    await project.save();

    user.projects.push(project._id);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: { _id: project._id, name: project.name },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const createService = async (req, res) => {
  try {
    const {
      projectId, serviceName, url,
      checkIntervalMins = 10,
      failThreshold     = 1,
      recoveryThreshold = 1,
      alertsEnabled     = false,
      alertChannels     = [],
    } = req.body;

    if (!projectId || !serviceName || !url) {
      return res.status(400).json({
        success: false,
        message: "projectId, serviceName, and url are required",
      });
    }

    const id = req.user.id;
    const project = await Project.findOne({ _id: projectId, userId: id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or access denied" });
    }

    const service = new Service({
      serviceName: serviceName.trim(),
      url,
      checkIntervalMins: Math.max(1, Math.min(1440, Number(checkIntervalMins) || 10)),
      failThreshold:     Math.max(1, Math.min(10,   Number(failThreshold)     || 1)),
      recoveryThreshold: Math.max(1, Math.min(10,   Number(recoveryThreshold) || 1)),
      alertsEnabled:     Boolean(alertsEnabled),
      alertChannels:     alertChannels || [],
      projectId: project._id,
    });

    await service.save();
    project.services.push(service._id);
    await project.save();

    initializeService(service).catch(() => {});

    return res.status(201).json({ success: true, message: "Service created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const projectId = req.body.projectId;
    const id = req.user.id;

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId: id })
      .select("name services")
      .populate({
        path: "services",
        select:
          "serviceName url currentStatus upCount downCount avgResponseTime lastCheckedAt monitorLogs",
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { serviceId, projectId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Delete all monitor logs
    await MonitorLog.deleteMany({ _id: { $in: service.monitorLogs } });
    await Service.findByIdAndDelete(serviceId);

    project.services = project.services.filter(
      (id) => id.toString() !== serviceId
    );
    await project.save();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    // Delete all services and their logs
    for (const serviceId of project.services) {
      const service = await Service.findById(serviceId);
      if (service) {
        await MonitorLog.deleteMany({ _id: { $in: service.monitorLogs } });
        await Service.findByIdAndDelete(serviceId);
      }
    }

    await Project.findByIdAndDelete(projectId);

    const user = await User.findById(userId);
    user.projects = user.projects.filter((id) => id.toString() !== projectId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const userId = req.user.id;

    const service = await Service.findById(serviceId).populate(
      "projectId",
      "name userId"
    );

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    if (service.projectId?.userId?.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // ── Date range for charts (default: last 7 days) ────────────────────────
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fromDate = req.query.from ? new Date(req.query.from) : defaultFrom;
    const toDate = req.query.to ? new Date(req.query.to) : now;

    // Clamp limit
    const limit = Math.min(parseInt(req.query.limit) || 1000, 2000);

    // Logs for the selected date range (for charts)
    const rangeLogs = await MonitorLog.find({
      _id: { $in: service.monitorLogs },
      hitTime: { $gte: fromDate, $lte: toDate },
    })
      .sort({ hitTime: 1 })
      .limit(limit)
      .lean();

    // ── Period stats helper ─────────────────────────────────────────────────
    const computePeriodStats = async (daysBack) => {
      const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const logs = await MonitorLog.find({
        _id: { $in: service.monitorLogs },
        hitTime: { $gte: since },
      })
        .sort({ hitTime: 1 })
        .lean();

      if (logs.length === 0) {
        return { uptime: null, incidents: 0, downtimeMins: 0, mtbf: null, checks: 0 };
      }

      // Use the service's actual check interval for accurate downtime calculation
      const CHECK_INTERVAL_MINS = service.checkIntervalMins || 10;

      let upChecks = 0, downChecks = 0, incidents = 0;
      let prevWasDown = false, totalDowntimeMins = 0;

      for (const log of logs) {
        const s = Number(log.status);
        const isDown = s === 0 || s >= 400 || (s > 0 && s < 200);

        if (isDown) {
          downChecks++;
          if (!prevWasDown) incidents++;
          totalDowntimeMins += CHECK_INTERVAL_MINS;
          prevWasDown = true;
        } else {
          upChecks++;
          prevWasDown = false;
        }
      }

      const totalChecks = upChecks + downChecks;
      const uptimePct   = totalChecks > 0 ? (upChecks / totalChecks) * 100 : null;
      const totalUpMins = upChecks * CHECK_INTERVAL_MINS;
      const mtbfHours   = incidents > 0 ? Math.round(totalUpMins / incidents / 60) : null;

      return {
        uptime:      uptimePct !== null ? parseFloat(uptimePct.toFixed(3)) : null,
        incidents,
        downtimeMins: totalDowntimeMins,
        mtbf:        mtbfHours,
        checks:      totalChecks,
      };
    };

    const [stats24h, stats7d, stats30d, stats365d] = await Promise.all([
      computePeriodStats(1),
      computePeriodStats(7),
      computePeriodStats(30),
      computePeriodStats(365),
    ]);

    const responseData = {
      _id: service._id,
      serviceName: service.serviceName,
      url: service.url,
      currentStatus: service.currentStatus,
      upCount: service.upCount,
      downCount: service.downCount,
      avgResponseTime: service.avgResponseTime,
      lastCheckedAt: service.lastCheckedAt,
      totalLogs: service.monitorLogs.length,
      // Monitoring config
      checkIntervalMins: service.checkIntervalMins,
      failThreshold:     service.failThreshold,
      recoveryThreshold: service.recoveryThreshold,
      incidentState:     service.incidentState,
      alertsEnabled:     service.alertsEnabled,
      alertChannels:     service.alertChannels,
      projectId: {
        _id: service.projectId._id,
        name: service.projectId.name,
      },
      monitorLogs: rangeLogs,
      range: { from: fromDate, to: toDate },
      periodStats: { "24h": stats24h, "7d": stats7d, "30d": stats30d, "365d": stats365d },
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user.id;

    const service = await Service.findById(serviceId).populate("projectId", "userId");
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (service.projectId?.userId?.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      serviceName, url,
      checkIntervalMins, failThreshold, recoveryThreshold,
      alertsEnabled, alertChannels,
    } = req.body;

    if (serviceName)         service.serviceName         = serviceName.trim();
    if (url)                 service.url                 = url;
    if (checkIntervalMins != null) service.checkIntervalMins = Math.max(1, Math.min(1440, Number(checkIntervalMins)));
    if (failThreshold     != null) service.failThreshold     = Math.max(1, Math.min(10,   Number(failThreshold)));
    if (recoveryThreshold != null) service.recoveryThreshold = Math.max(1, Math.min(10,   Number(recoveryThreshold)));
    if (alertsEnabled     != null) service.alertsEnabled     = Boolean(alertsEnabled);
    if (alertChannels)             service.alertChannels     = alertChannels;

    // Reset nextCheckAt so the change takes effect immediately
    service.nextCheckAt = new Date();

    await service.save();

    return res.status(200).json({ success: true, message: "Service updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
