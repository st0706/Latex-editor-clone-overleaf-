import React from 'react'
import NavBar from '../components/NavBar'
import { Button, Container, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom'

const Homepage = () => {
  return (
    <>
    <NavBar/>
    <Container style={{ height: '100vh' }}>
        <Grid 
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          style={{ height: '100%' }}
        >
          <Grid item>
            <Link to="/project" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary">New Project</Button>
            </Link>
            <Button onClick={() => {
              localStorage.removeItem('token');
            }} variant="contained" color="primary">SignOut</Button>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default Homepage