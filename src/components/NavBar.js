import React from "react";
import Logo from "./Logo";
import { Link } from 'react-router-dom'

function NavBar() {
  return (
    <nav className="navbar">
      <h3 className="title">
      <Link to="/"><Logo /></Link>
     &nbsp;OVERLEAF
      </h3>
    </nav>
  );
}

export default NavBar;
