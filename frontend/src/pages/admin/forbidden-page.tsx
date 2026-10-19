import React from "react";

const ForbiddenPage = () => {
  return (
    <div className="container mx-auto flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold mb-4">403 Forbidden</h1>
      <p className="text-lg">
        Sorry, you do not have permission to access this resource.
      </p>
    </div>
  );
};

export default ForbiddenPage;
