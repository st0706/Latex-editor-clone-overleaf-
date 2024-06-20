import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import WorkArea from "../components/WorkArea";
import { useParams } from "react-router-dom";
import api from "../api";

function App() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const fetchProjectData = async () => {
    try {
      const response = await api.get(`http://localhost:8080/projects/${id}`);
      const data = await response.data;
      setTitle(data.title);
      setAuthor(data.author);
      setUpdatedAt(data.updatedAt);
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  return (
    <div>
      <NavBar />
      <WorkArea />
    </div>
  );
}

export default App;
