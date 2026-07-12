import { Box, Grid, Typography, Skeleton, Chip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { ArrowBackRounded, LayersRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllServices } from "../../redux/apis/userApis";
import ServiceCard from "./ServiceCard";
import { CreateServiceDialog } from "../services/CreateService";
import DeleteDialog from "../dialog/DeleteDialog";
import { T } from "../../theme/theme";

interface Service {
  _id: string; serviceName: string; url: string;
  upCount: number; downCount: number; monitorLogs: string[];
  currentStatus: number; avgResponseTime?: number; lastCheckedAt?: string;
}

function ProjectPage() {
  const theme   = useTheme();
  const L       = theme.palette.mode === "light";
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [update, setUpdate] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    getAllServices(projectId)
      .then((res) => {
        if (res.status === 200 && res.data) {
          setServices(res.data.project?.services ?? []);
          setProjectName(res.data.project?.name ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [update, projectId]);

  const upCount   = services.filter(s => Number(s.currentStatus) >= 200 && Number(s.currentStatus) < 300).length;
  const downCount = services.filter(s => Number(s.currentStatus) >= 400 || (Number(s.currentStatus) > 0 && Number(s.currentStatus) < 200)).length;
  const allGood   = services.length > 0 && downCount === 0;

  return (
    <Box sx={{ pt: 3 }}>
      {/* Breadcrumb — always visible */}
      <Box onClick={() => navigate(-1)} sx={{
        display: "inline-flex", alignItems: "center", gap: 0.75, cursor: "pointer",
        color: "text.secondary", "&:hover": { color: "text.primary" }, transition: "color 0.15s",
        mb: 3,
      }}>
        <ArrowBackRounded sx={{ fontSize: 14 }} />
        <Typography variant="caption" fontWeight={500}>Back to Dashboard</Typography>
      </Box>

      {/* Page header — always rendered, name skeletons inline */}
      <Box sx={{
        p: "20px 24px", mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap", gap: 2,
      }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            {loading
              ? <Skeleton width={180} height={22} />
              : (
                <>
                  <Typography variant="h3" color="text.primary">{projectName}</Typography>
                  {services.length > 0 && (
                    <Chip
                      label={allGood ? "Operational" : `${downCount} issue${downCount !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{
                        fontWeight: 700, height: 22, fontSize: "0.6875rem",
                        backgroundColor: allGood ? (L ? T.upBg : alpha(T.up, 0.14)) : (L ? T.downBg : alpha(T.down, 0.14)),
                        color: allGood ? T.up : T.down,
                        border: `1px solid ${allGood ? (L ? T.upBorder : alpha(T.up, 0.3)) : (L ? T.downBorder : alpha(T.down, 0.3))}`,
                      }}
                    />
                  )}
                </>
              )
            }
          </Box>
          <Typography variant="caption" color="text.secondary">
            {loading ? <Skeleton width={140} height={14} /> : (
              <>
                {services.length} service{services.length !== 1 ? "s" : ""}
                {services.length > 0 && ` · ${upCount} healthy · ${downCount} degraded`}
              </>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteDialog projectId={projectId!} serviceId="" projectName={projectName} type="DELPRO" serviceName="" />
          <CreateServiceDialog projectId={projectId!} update={update} setUpdate={setUpdate} />
        </Box>
      </Box>

      {/* Services label — always visible */}
      <Typography variant="overline" color="text.disabled" sx={{ display: "block", mb: 1.5 }}>
        Services
      </Typography>

      {/* Service cards — skeleton only this area */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={168} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : services.length === 0 ? (
        <Box sx={{
          py: 9, display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5,
          border: `1.5px dashed ${theme.palette.divider}`, borderRadius: 2, textAlign: "center",
        }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 2,
            backgroundColor: alpha(theme.palette.secondary.main, L ? 0.1 : 0.15),
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LayersRounded sx={{ fontSize: 26, color: theme.palette.secondary.main }} />
          </Box>
          <Box>
            <Typography variant="h5" color="text.primary" gutterBottom>No services yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Add an endpoint URL to begin monitoring response time and uptime.
            </Typography>
          </Box>
          <CreateServiceDialog projectId={projectId!} update={update} setUpdate={setUpdate} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {services.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s._id}>
              <ServiceCard
                serviceName={s.serviceName} url={s.url} currentStatus={s.currentStatus}
                upCount={s.upCount} downCount={s.downCount} id={s._id}
                monitorLogs={s.monitorLogs} projectId={projectId!}
                avgResponseTime={s.avgResponseTime} lastCheckedAt={s.lastCheckedAt}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ProjectPage;
