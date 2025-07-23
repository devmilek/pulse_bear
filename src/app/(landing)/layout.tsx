import React from "react";
import { Navbar } from "@/components/navbar";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default LandingLayout;
