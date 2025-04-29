import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext"; // Import AuthProvider
import { Login } from "../views/Login";
import { Test } from "../views/Test";
import { Dashboard } from "../views/Dashboard";
import { Profile } from "../views/Profile";
import { Course } from "../views/Course";
import { AdminPanel } from "../views/AdminPanel";

export const App = () => {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Test />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/course/:id" element={<Course />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
