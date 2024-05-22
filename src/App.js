import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Project from "./pages/Project";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={< Homepage/>}></Route>
    <Route path="/project" element={<Project />}></Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
