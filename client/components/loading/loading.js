import React from "react";
import { Grid } from "react-css-spinners";

export default function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen bg-rgba(232,234,238,1)">
      <Grid color="rgb(129, 17, 11)" size={70} thickness={14} />
    </div>
  );
}
