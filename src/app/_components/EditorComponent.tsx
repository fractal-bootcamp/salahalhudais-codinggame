import React from "react";
import Editor from "@monaco-editor/react";

interface EditorComponentProps {
  code: string;
  setCode: (code: string) => void;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ code, setCode }) => {
  return (
    <Editor
      height="70vh"
      language="javascript"
      value={code}
      onChange={(value) => setCode(value || "")}
      options={{ minimap: { enabled: false } }}
    />
  );
};

export default EditorComponent;