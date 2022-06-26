import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function LoadJSONForm({ setJsonData, setDataType }) {
  function handleChange(event) {
    const file = event.target.files[0];

    if (file.type === "application/json") {
      file.text().then((data) => {
        setJsonData(JSON.parse(data));
      });
      if (file.name.includes("pendingRequests")) setDataType("pendingRequests");
      if (file.name.includes("users2")) setDataType("users");
    } else {
      console.log('"application/json" expected but file type is', file.type);
    }
  }

  return (
    <div className="App">
      <form>
        <input type="file" className="dragndrop-zone" onChange={handleChange} />
      </form>
    </div>
  );
}

export default LoadJSONForm;
