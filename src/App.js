import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useNavigate  } from "react-router-dom";
import Project from "./pages/Project";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import SignUp from "./pages/Register";
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // const navigate = useNavigate(); 
console.log(isAuthenticated);
  useEffect(() => {
    // Check for existing token and user data in localStorage on initial render
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // Fetch user data if token exists
      fetchUserData(token);
    }
  }, []);
  
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user data:", response.statusText);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        return;
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={< Homepage/>}></Route>
    <Route path="/project" element={<Project />}></Route>
    <Route path="/login" element={<Login />}></Route>
    <Route path="/register" element={<SignUp />}></Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
