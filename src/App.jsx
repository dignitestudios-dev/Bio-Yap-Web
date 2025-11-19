import { Route, Routes } from "react-router";
import "./App.css";
import Home from "./pages/app/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:token" element={<Home />} />

      <Route
        path="*"
        element={<div className="text-7xl">Page Not Found</div>}
      />
    </Routes>
  );
}

export default App;
