import { useEffect, useState } from "react";
import "../style/root.css";
import "../style/AdminPanel.css";
import { NavComponent } from "../components/NavComponent";
import { useAuth } from "../context/AuthContext";

interface User {
  id: string;
  role: string;
  firstname: string;
  lastname: string;
}

export const AdminPanel = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // haetaan käyttäjiä hakusanalla
  useEffect(() => {
    if (!searchTerm) return;

    const searchForUsers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/search-users/${encodeURIComponent(
            searchTerm
          )}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: User[] = await response.json();

        setSearchResults(data);
      } catch (error) {
        console.error("Error searching for users", error);
      }
    };

    searchForUsers();
  }, [searchTerm]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/update-role/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating role", error);
    }
  };

  const handlePasswordChange = async (userId: string, newPassword: string) => {
    if (newPassword.length === 0) {
      alert("Salasana ei voi olla tyhjä");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/update-password/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update password");
      } else {
        alert("Salasana vaihdettu onnistuneesti");
      }
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.id === userId ? { ...user, password: newPassword } : user
        )
      );
    } catch (error) {
      console.error("Error updating password", error);
    }
  };

  return (
    <>
      {user?.role == "admin" && (
        <div className="container">
          <NavComponent />
          <div className="adminpanel-content">
            <h1>Hallintapaneeli</h1>

            <h2>Hallinnoi käyttäjiä</h2>
            <input
              type="text"
              placeholder="Hae käyttäjiä"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              spellCheck="false"
            />
            {searchResults.length > 0 && (
              <div className="">
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {searchResults
                    .filter((user) => user.role !== "admin")
                    .map((user) => (
                      <li
                        style={{
                          background: "var(--aliceblue)",
                          padding: "1em",
                          borderRadius: "15px",
                          margin: "1em 0",
                          display: "flex",
                          flexDirection: "column",
                          gap: "1em",
                        }}
                        key={user.id}
                      >
                        <h2>{`${user.firstname} ${user.lastname}:`}</h2>
                        <h3>vaihda rooli</h3>
                        <select
                          style={{
                            fontSize: "1.3em",
                          }}
                          value={user.role}
                          onChange={(event) =>
                            handleRoleChange(user.id, event.target.value)
                          }
                        >
                          <option value="student">oppilas</option>
                          <option value="teacher">opettaja</option>
                        </select>
                        <div>
                          <h3>vaihda salasana</h3>
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              const form = event.target as HTMLFormElement;
                              const newPassword = (
                                form.elements.namedItem(
                                  "password"
                                ) as HTMLInputElement
                              ).value;
                              handlePasswordChange(user.id, newPassword);
                            }}
                          >
                            <input
                              style={{ fontSize: "1em" }}
                              type="password"
                              name="password"
                              placeholder="uusi salasana"
                              spellCheck="false"
                            />
                            <button
                              style={{
                                background: "var(--emerald)",
                                padding: "0.5em",
                              }}
                              type="submit"
                            >
                              Vaihda salasana
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
