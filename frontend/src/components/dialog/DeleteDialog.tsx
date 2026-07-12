import * as React from "react";
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Tooltip, IconButton, Box, Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { DeleteOutlineRounded, WarningAmberRounded } from "@mui/icons-material";
import { deleteProject, deleteService } from "../../redux/apis/userApis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Props {
  projectId: string; serviceId: string;
  type: "DELPRO" | "DELSER"; projectName: string; serviceName: string;
}

export default function DeleteDialog(props: Props) {
  const theme     = useTheme();
  const L         = theme.palette.mode === "light";
  const [open, setOpen]       = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const navigate  = useNavigate();

  const isProject = props.type === "DELPRO";
  const name      = isProject ? props.projectName : props.serviceName;

  const handleDelete = async () => {
    setLoading(true);
    const res = isProject
      ? await deleteProject(props.projectId)
      : await deleteService(props.serviceId, props.projectId);
    setLoading(false);

    if (res.status === 200) {
      setOpen(false);
      toast.success(`${isProject ? "Project" : "Service"} deleted`);
      navigate(isProject ? "/dashboard" : `/project/${props.projectId}`, { replace: true });
    } else {
      toast.error(res.error ?? "Delete failed — please try again");
    }
  };

  return (
    <>
      <Tooltip title={isProject ? "Delete project" : "Delete service"}>
        <IconButton
          onClick={() => setOpen(true)}
          size="small"
          sx={{
            color: "text.disabled",
            border: `1px solid ${theme.palette.divider}`,
            "&:hover": {
              color: theme.palette.error.main,
              borderColor: alpha(theme.palette.error.main, 0.4),
              backgroundColor: alpha(theme.palette.error.main, 0.06),
            },
          }}
        >
          <DeleteOutlineRounded sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
              backgroundColor: alpha(theme.palette.error.main, L ? 0.1 : 0.15),
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <WarningAmberRounded sx={{ fontSize: 17, color: theme.palette.error.main }} />
            </Box>
            <span>Delete {isProject ? "Project" : "Service"}</span>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            This will permanently delete{" "}
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              "{name}"
            </Box>
            {isProject && " and all its services and monitoring data"}
            .{" "}
            <Box component="span" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
              This cannot be undone.
            </Box>
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            disabled={loading}
            variant="text"
            color="inherit"
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="outlined"
            size="small"
            sx={{
              color: theme.palette.error.main,
              borderColor: alpha(theme.palette.error.main, 0.4),
              fontWeight: 600,
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.06),
                borderColor: theme.palette.error.main,
              },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            {loading ? "Deleting…" : `Delete ${isProject ? "Project" : "Service"}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
