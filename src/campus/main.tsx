import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CampusApp from "./CampusApp";
import "./campus.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CampusApp />
  </StrictMode>,
);
