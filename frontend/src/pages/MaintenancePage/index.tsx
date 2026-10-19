import React from "react";
import maintenance from "@/assets/maintenance.svg";
import logo from "@/assets/echo.svg";

const MaintenancePage = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-12 font-Buch">
      <div className="flex gap-2 mb-10">
        <img src={logo} width={"24px"} draggable="false" alt="logo" />
        <span className="font-Halbfett">Blueberry Chat</span>
      </div>
      <div className="text-3xl text-blue-500 font-bold">
        Under Maintenance
      </div>
      <p className="font-semibold">We'll Be Back Soon.</p>
      <img src={maintenance} draggable="false" className="w-96" alt="img" />
      <div className="text-selected text-center">
        <p>
          « We are undergoing maintenance and will be back online in a few
          hours. Thank you for your patience! »
        </p>
        <p>For any questions, please contact our team.</p>
      </div>
    </div>
  );
};

export default MaintenancePage;
