import React, { useEffect, useState } from "react";
import "../style/root.css";
import "../style/assignmentform.css";
import { FaPlus, FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { FaQuestionCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";

interface Course {
  name: string;
  id: string;
}

interface User {
  id: string;
  role: string;
  firstname: string;
  lastname: string;
}

interface AddMembersFormProps {
  course: Course;
  toggleAddMembersBox: () => void;
  onMembersAdded: () => void;
}

export const AddMembersForm: React.FC<AddMembersFormProps> = ({
  course,
  toggleAddMembersBox,
  onMembersAdded,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
  const [existingMembers, setExistingMembers] = useState<User[]>([]);

  // haetaan kurssin jäsenet
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/course-members/${course.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: User[] = await response.json();
        setExistingMembers(data);
      } catch (error) {
        console.error("Error fetching course members", error);
      }
    };

    fetchMembers();
  }, [course.id]);

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

        // suodatetaan pois käyttäjät, jotka ovat jo osallistujia
        const filteredUsers = data.filter(
          (user) => !existingMembers.some((member) => member.id === user.id)
        );

        setSearchResults(filteredUsers);
      } catch (error) {
        console.error("Error searching for users", error);
      }
    };

    searchForUsers();
  }, [searchTerm, existingMembers]);

  const handleAddUser = (user: User): void => {
    if (!usersToAdd.some((u) => u.id === user.id)) {
      setUsersToAdd([...usersToAdd, user]);
    }
  };

  const handleDeleteUser = (user: User): void => {
    setUsersToAdd(usersToAdd.filter((u) => u.id !== user.id));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/add-member-to-course`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: course.id,
            userIds: usersToAdd.map((user) => user.id),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const notify = () =>
        toast.success("Uudet osallistujat lisätty onnistuneesti!", {
          position: "bottom-center",
          autoClose: 2500,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

      notify();

      // odotetaan, että käyttäjä ehtii lukea ilmoituksen, ennen kuin lomake suljetaan
      setTimeout(() => (toggleAddMembersBox(), onMembersAdded()), 3000);
    } catch (error) {
      console.error("Error adding users:", error);
    }
  };

  return (
    <div className="back-shadow">
      <form className="add-members-form" onSubmit={handleSubmit}>
        <h2>
          Lisää osallistujia kurssille <span>{course.name}</span>
        </h2>
        <div className="add-members-form-content">
          <div className="search">
            <label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Hae osallistujia</span>
                <FaQuestionCircle
                  style={{ color: "var(--emerald)", scale: "1.5" }}
                  className="search-question"
                  onMouseEnter={() => {
                    document
                      .querySelector(".search-info")
                      ?.setAttribute("style", "display: flex;");
                  }}
                  onMouseLeave={() => {
                    document
                      .querySelector(".search-info")
                      ?.setAttribute("style", "display: none;");
                  }}
                />
                <div className="search-info">
                  <p>Kurssille jo osallistuvat eivät näy hakutuloksissa.</p>
                </div>
              </div>

              <input
                className="add-members-input"
                type="text"
                placeholder="Etsi uutta osallistujaa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                spellCheck="false"
              />
            </label>

            {searchResults.length > 0 && (
              <div className="search-results">
                <ul>
                  {searchResults
                    .filter((user) => user.role !== "admin")
                    .map((user) => (
                      <li key={user.id}>
                        <h4>{`${user.firstname} ${user.lastname}`}</h4>
                        {usersToAdd.some((u) => u.id === user.id) ? (
                          <button
                            type="button"
                            className="added-button"
                            disabled
                          >
                            <FaCheck /> Lisätty
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddUser(user)}
                          >
                            <FaPlus /> Lisää
                          </button>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {usersToAdd.length > 0 && (
            <motion.div
              className="users-to-add"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <ul>
                <li>
                  <h3>Lisättävät käyttäjät</h3>
                </li>
                {usersToAdd.map((user) => (
                  <motion.li
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4>{`${user.firstname} ${user.lastname}`}</h4>
                    <button onClick={() => handleDeleteUser(user)}>
                      <ImCross /> Poista
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        <div className="buttons">
          <button className="cancel-button" onClick={toggleAddMembersBox}>
            Peruuta
          </button>
          {usersToAdd.length === 0 ? (
            <button type="button" className="disabled-button" disabled>
              Lisää osallistuja
            </button>
          ) : (
            <button type="submit">
              {usersToAdd.length > 1
                ? "Lisää osallistujat"
                : "Lisää osallistuja"}
            </button>
          )}
        </div>
      </form>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};
