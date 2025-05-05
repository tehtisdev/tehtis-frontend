import "../style/root.css";
import "../style/Profile.css";
import "../style/Dashboard.css";
import { ProfileComponent } from "../components/ProfileComponent";
import { NavComponent } from "../components/NavComponent";
import { useAuth } from "../context/AuthContext";

export const Profile = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="container">
        <div className="nav-background"></div>
        <NavComponent />
        {user && <ProfileComponent user={user} />}
      </div>
    </>
  );
};
