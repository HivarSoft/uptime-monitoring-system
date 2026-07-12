import { Box, Grid, Skeleton, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ProjectCard from "./ProjectCard";
import { useEffect, useState } from "react";
import { getAllProjects } from "../../redux/apis/userApis";
import { CreateProjectDialog } from "../services/CreateProject";
import { useAppSelector } from "../../redux/hooks";
import { selectUser } from "../../redux/reducers/userReducer";
import { FolderOpenRounded } from "@mui/icons-material";
import { T } from "../../theme/theme";

interface Project {
  name: string; _id: string;
  services: { _id: string; serviceName: string; currentStatus: number }[];
  userId: string;
}

function Dashboard() {
  const theme   = useTheme();
  const L       = theme.palette.mode === "light";
  const [update, setUpdate]   = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    setLoading(true);
    getAllProjects()
      .then((res) => {
        if (res.status === 200 && res.data) {
          const data = res.data as { user?: { projects?: Project[] } };
          setProjects(data.user?.projects ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, [update]);

  const totalServices = projects.reduce((a, p) => a + (p.services?.length ?? 0), 0);
  const totalUp   = projects.reduce((a, p) => a + (p.services?.filter(
    s => Number(s.currentStatus) >= 200 && Number(s.currentStatus) < 300).length ?? 0), 0);
  const totalDown = totalServices - totalUp;

  const stats = [
    { label: "Projects",   value: projects.length, color: theme.palette.primary.main,   bg: alpha(theme.palette.primary.main, L ? 0.08 : 0.14) },
    { label: "Services",   value: totalServices,   color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, L ? 0.08 : 0.14) },
    { label: "Healthy",    value: totalUp,          color: T.up,                          bg: L ? T.upBg   : alpha(T.up, 0.14) },
    { label: "Degraded",   value: totalDown,        color: T.down,                        bg: L ? T.downBg : alpha(T.down, 0.14) },
  ];

  return (
    <Box sx={{ pt: 4 }}>
      {/* Page heading — always visible */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 5 }}>
        <Box>
          <Typography variant="h2" color="text.primary" gutterBottom>
            {user.firstName ? `Good to see you, ${user.firstName}` : "Dashboard"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time status of all your monitored endpoints
          </Typography>
        </Box>
      </Box>

      {/* Stat tiles — numbers skeleton inline, tiles always rendered */}
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {stats.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Box sx={{
              p: "18px 20px", borderRadius: 2.5,
              backgroundColor: s.bg,
              border: `1px solid ${alpha(s.color, L ? 0.18 : 0.25)}`,
            }}>
              <Box sx={{ minHeight: 38, display: "flex", alignItems: "center", mb: 0.5 }}>
                {loading
                  ? <Skeleton width={32} height={32} sx={{ bgcolor: alpha(s.color, 0.15) }} />
                  : <Typography sx={{ fontSize: "1.875rem", fontWeight: 800, color: s.color, lineHeight: 1.1 }}>
                      {s.value}
                    </Typography>
                }
              </Box>
              <Typography variant="caption" sx={{ color: s.color, fontWeight: 600, opacity: 0.75 }}>
                {s.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Section header — always visible */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Box>
          <Typography variant="h5" color="text.primary">Projects</Typography>
          {!loading && projects.length > 0 && (
            <Typography variant="caption" color="text.disabled">
              {projects.length} project{projects.length !== 1 ? "s" : ""} · {totalServices} service{totalServices !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
        <CreateProjectDialog update={update} setUpdate={setUpdate} />
      </Box>

      {/* Cards — skeleton only the card area */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rounded" height={148} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : projects.length === 0 ? (
        <EmptyProjects update={update} setUpdate={setUpdate} />
      ) : (
        <Grid container spacing={2}>
          {projects.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
              <ProjectCard id={p._id} name={p.name} services={p.services} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function EmptyProjects({ update, setUpdate }: { update: number; setUpdate: (n: number) => void }) {
  const theme = useTheme();
  const L = theme.palette.mode === "light";
  return (
    <Box sx={{
      mt: 2, py: 10,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5,
      border: `1.5px dashed ${theme.palette.divider}`,
      borderRadius: 2.5, textAlign: "center",
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, L ? 0.08 : 0.14),
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FolderOpenRounded sx={{ fontSize: 28, color: theme.palette.primary.main }} />
      </Box>
      <Box>
        <Typography variant="h5" color="text.primary" gutterBottom>No projects yet</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          Create your first project to start monitoring your services and endpoints.
        </Typography>
      </Box>
      <CreateProjectDialog update={update} setUpdate={setUpdate} />
    </Box>
  );
}

export default Dashboard;
