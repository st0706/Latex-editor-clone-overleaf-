import { Button, Container, Grid, Stack, Typography } from "@mui/material";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import ResponsiveAppBar from "../components/AppBar";
import TableProjects from "../components/TableProjects";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import placeholder from "../components/placeholder";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const Homepage = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const response = await api.get("http://localhost:8080/me");
      const data = await response.data;
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove("token");
    }
  };

  useEffect(() => {
    fetchUserData();
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
              <MenuItem onClick={handleClickOpen}>Blank Project</MenuItem>
              <MenuItem onClick={handleClickOpen}>Example Project</MenuItem>
            </Menu>
          </Stack>
          <TableProjects />
        </Grid>
      </Container>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const data = {
              title: formJson.projectName,
              content: placeholder,
              userId: user ? user.id : null,
            };
            try {
              const res = await api.post(
                "http://localhost:8080/projects",
                data
              );
              const newProjectId = res.data.id;
              if (newProjectId) {
                handleClose();
                navigate(`/project/${newProjectId}`);
              }
            } catch (error) {
              if (error.response && error.response.data) {
                console.log(error.response.data.message);
              } else {
                console.log("An error occurred. Please try again.");
              }
            }
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
    </>
  );
};

export default Homepage;
