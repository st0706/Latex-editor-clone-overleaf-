import React, { useState, useEffect } from "react";
import Split from "react-split";
import Editor from "./Editor";
import Preview from "./Preview";

function WorkArea(props) {
  const { content, onData } = props;
  let markdown = localStorage.getItem("markdown") || content;
  const [latex, setLatex] = useState(markdown);
  const [orientation, setOrientation] = useState("horizontal");
  const [compiled, isCompiled] = useState(true);

  useEffect(() => {
    let changeOrientation = () => {
      setOrientation(window.innerWidth < 600 ? "vertical" : "horizontal");
    };
    changeOrientation();
    window.onresize = changeOrientation;
  }, []);

  useEffect(() => {
    if (latex) onData(latex);
  }, [latex]);

  return (
    <div className="work-area">
      <Split
        className="wrapper-card"
        sizes={[50, 50]}
        minSize={orientation === "horizontal" ? 300 : 100}
        expandToMin={true}
        gutterAlign="center"
        direction={orientation}
      >
        <Editor
          content={latex}
          changeContent={setLatex}
          isCompiled={isCompiled}
          compiled={compiled}
        />
        <Preview content={latex} isCompiled={isCompiled} />
      </Split>
    </div>
  );
}

export default WorkArea;
