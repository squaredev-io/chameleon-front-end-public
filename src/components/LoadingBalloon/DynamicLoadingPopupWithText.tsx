import React from "react";
import colors from "tailwindcss/colors";
import { Loader } from "lucide-react";

type LoadingBalloonProps = {
  text?: string;
};

const DynamicLoadingPopupWithText = ({ text }: LoadingBalloonProps) => {
  return (
    <div style={{
      position: "absolute",
      top: "80%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px 20px",
      backgroundColor: colors.purple[700],
      color: colors.orange[100],
      borderRadius: "20px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      fontSize: "16px",
      fontWeight: "bold",
      textAlign: "center",
      zIndex: 9999
    }}>
      <span>{text || "Loading"}</span>
      <Loader className="w-5 h-5 text-gray-500 mt-2 animate-spin" />
    </div>
  );
};

export default DynamicLoadingPopupWithText;
