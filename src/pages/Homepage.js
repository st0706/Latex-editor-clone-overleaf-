import { Button, Container, Grid, Stack, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Cookies from "js-cookie";
import moment from "moment/moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ResponsiveAppBar from "../components/AppBar";
import { BlankPlaceholder } from "../components/BlankPlaceholder";
import placeholder from "../components/placeholder";
import TableProjects from "../components/TableProjects";

const Homepage = () => {
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState("success");
  const [message, setMessage] = React.useState("");
  const handleCloseDialog = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const [dataProject, setDataProject] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const [dialogState, setDialogState] = React.useState({
    open: false,
    projectType: "",
  });

  const handleClickOpen = (type) => {
    setDialogState({ open: true, projectType: type });
  };

  const handleClose = () => {
    setDialogState({ open: false, projectType: "" });
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const getMonthYear = () => {
    const today = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = today.getMonth(); // Get month index (0-11)
    const month = monthNames[monthIndex];
    const year = today.getFullYear();

    return `${month} ${year}`;
  };

  function buildData(data, userId) {
    return data
      .filter((record) => record.userId === userId)
      .map((record) => ({
        ...record,
        updatedAt: moment(record.updatedAt).format("DD/MM/YYYY HH:mm:ss"),
      }));
  }

  const fetchUserData = async () => {
    try {
      const response = await api.get("http://localhost:8080/me");
      const data = await response.data;
      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.log(error.message);
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove("token");
    }
  };
  const fetchProjectData = async (user) => {
    try {
      const response = await api.get("http://localhost:8080/projects");
      let data = await response.data;
      data = buildData(data, user.id);
      setDataProject(data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchUserData().then((res) => fetchProjectData(res));
  }, []);

  return (
    <>
      <ResponsiveAppBar user={user} isAuthenticated={isAuthenticated} />
      <Container style={{ height: "100vh" }}>
        <Grid container>
          <Stack
            m={5}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            style={{ width: "100%" }}
          >
            <Typography
              variant="h5"
              style={{ flexGrow: 1, textAlign: "center" }}
            >
              All Projects
            </Typography>
            <Button
              id="basic-button"
              aria-controls={openMenu ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? "true" : undefined}
              onClick={handleClick}
              variant="contained"
              color="primary"
            >
              New Project
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={() => handleClickOpen("blank")}>
                Blank Project
              </MenuItem>
              <MenuItem onClick={() => handleClickOpen("example")}>
                Example Project
              </MenuItem>
            </Menu>
          </Stack>
          {dataProject?.length > 0 && (
            <TableProjects dataProject={dataProject} />
          )}
        </Grid>
      </Container>
      <Dialog
        open={dialogState.open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: async (event) => {
            event.preventDefault();
            if (user) {
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const data =
                dialogState.projectType === "example"
                  ? {
                      title: formJson.projectName,
                      content: placeholder,
                      userId: user ? user.id : null,
                    }
                  : {
                      title: formJson.projectName,
                      content: BlankPlaceholder(
                        formJson.projectName,
                        user.name,
                        getMonthYear()
                      ),
                      userId: user ? user.id : null,
                    };
              try {
                const res = await api.post(
                  "http://localhost:8080/projects",
                  data
                );
                const newProjectId = res.data.id;
                if (newProjectId) {
                  setMessage("Create new project successfully!");
                  setSeverity("success");
                  handleClose();
                  setTimeout(() => {
                    navigate(`/project/${newProjectId}`);
                  }, 1000);
                }
              } catch (error) {
                if (error.response && error.response.data) {
                  console.log(error.response.data.message);
                } else {
                  console.log("An error occurred. Please try again.");
                }
              }
            } else {
              setMessage("Please log in to create project");
              setSeverity("error");
            }
            setOpen(true);
          },
        }}
      >
        <DialogTitle>New Project</DialogTitle>
        <DialogContent style={{ minWidth: "500px" }}>
          <DialogContentText></DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="projectName"
            name="projectName"
            label="Project name"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        open={open}
        autoHideDuration={3000}
        onClose={handleCloseDialog}
      >
        <Alert
          onClose={handleCloseDialog}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Homepage;
