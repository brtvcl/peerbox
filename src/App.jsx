import React from "react";
import icon from "./icon.svg";

console.log(icon);
const App = () => {

  console.log("hello webpack");
  return (
    <div className="bg-green-400">
      <h1>Hello Tailwind!</h1>
      <img src={icon} width="40px" alt="" />
    </div>
  );
};

export default App;