import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export const NavComponent = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const greenColor = "#30c67c";

  const getLinkStyle = (path: string) => {
    return window.location.pathname === path
      ? { color: greenColor, fontWeight: "bold" }
      : {};
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/logout`, {
        method: "POST",
      });

      if (response.ok) {
        logout(); // Clear the authentication state
        navigate("/login"); // Redirect to login page
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav>
      <ul>
        <li>
          <h2>Tehtis</h2>
        </li>
        <li>
          <Link to="/dashboard" style={getLinkStyle("/dashboard")}>
            Etusivu
          </Link>
        </li>
        <li>
          <Link to="/profile" style={getLinkStyle("/profile")}>
            Profiili
          </Link>
        </li>
        <li>
          <a onClick={handleLogout}>Kirjaudu ulos</a>
        </li>
      </ul>
    </nav>
  );
};
