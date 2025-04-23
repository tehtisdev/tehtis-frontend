import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Test = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, []);

  return (
    <div style={{ margin: "auto" }}>
      <h1>Test</h1>

      <button onClick={() => navigate("/login")}>Login</button>
    </div>
  );
};
