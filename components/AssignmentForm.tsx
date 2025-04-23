import React, { useEffect, useState } from "react";
import "../style/root.css";
import "../style/assignmentform.css";
import { toast, ToastContainer } from "react-toastify";
import { TextEditorComponent } from "./TextEditorComponent";
interface AssignmentFormProps {
  courseId: number;
  onAssignmentAdded: () => void; // Callback to refresh assignments list
  toggleAssignmentBox: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  courseId,
  onAssignmentAdded,
  toggleAssignmentBox,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // lomakkeen käsittely, lähetetään uuden tehtävän tiedot palvelimelle
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newAssignment = {
      title,
      description,

      courseId,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/add-assignment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAssignment),
        }
      );

      const result = await response.json();

      if (result.success) {
        const notify = () =>
          toast.success("Uusi tehtävä lisätty onnistuneesti!", {
            position: "bottom-center",
            autoClose: 2500,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });

        notify();

        setTimeout(() => {
          console.log("Assignment added:", result);
          setTitle("");
          setDescription("");
          toggleAssignmentBox(); // suljetaan tehtävänlisäyslomake
          onAssignmentAdded(); // päivitetään tehtävälista
        }, 3000);
      } else {
        alert("Failed to add assignment.");
      }
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  };

  const [optimisticTitle, setOptimisticTitle] = useState("");

  useEffect(() => {
    setOptimisticTitle(title);
  }, [title]);

  return (
    <>
      <div className="back-shadow">
        <form className="assignmentform" onSubmit={handleSubmit}>
          {optimisticTitle.length > 0 ? (
            <h2>Lisää uusi tehtävä: {optimisticTitle}</h2>
          ) : (
            <h2>Lisää uusi tehtävä</h2>
          )}

          <label>
            <span>Otsikko:</span>

            <input
              className="assignment-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              spellCheck="false"
            />
          </label>

          <label>
            <span>Kuvaus:</span>
          </label>
          <div className="assignment-desc-editor" style={{ height: "20em" }}>
            <TextEditorComponent
              content={description}
              setContent={setDescription}
            />
          </div>
          <div className="buttons">
            <button className="cancel-button" onClick={toggleAssignmentBox}>
              Peruuta
            </button>
            {title.length === 0 ? (
              <button className="disabled-button" disabled>
                Lisää tehtävä
              </button>
            ) : (
              <button type="submit">Lisää tehtävä</button>
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
    </>
  );
};
