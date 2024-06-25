import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import WorkArea from "../components/WorkArea";
import { useParams } from "react-router-dom";
import api from "../api";

function App() {
  const { id } = useParams();
  const [title, setTitle] = useState();
  const [content, setContent] = useState();

  const fetchProjectData = async () => {
    try {
      const response = await api.get(`http://localhost:8080/projects/${id}`);
      const data = await response.data;
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  const handleDataFromWorkArea = (data) => {
    setContent(data);
  };

  return (
    <div>
      {id && title && content && (
        <NavBar id={id} title={title} content={content} />
      )}
      {content && (
        <WorkArea onData={handleDataFromWorkArea} content={content} />
      )}
    </div>
  );
}

export default App;
