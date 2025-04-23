import React, { useState } from "react";
import "../style/root.css";
import "../style/courseform.css";
import { toast, ToastContainer } from "react-toastify";

interface AddCourseFormProps {
  toggleAddCourseBox: () => void;
  user: { id: number; role: string; firstname: string; email: string } | null;
  getMyCourses: () => void;
}

export const AddCourseForm: React.FC<AddCourseFormProps> = ({
  toggleAddCourseBox,
  user,
  getMyCourses,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/add-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          description: "kurssin kuvaus",
          ownerId: user?.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Kurssi luotu:", result);
        console.log("kurssin data: ", result.data);

        const notify = () =>
          toast.success("Kurssi luotu onnistuneesti!", {
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
          setName("");
          getMyCourses();
          toggleAddCourseBox();
        }, 2000);
      } else {
        alert("Kurssin luonti epäonnistui.");
      }
    } catch (error) {
      console.error("Virhe kurssin luonnissa:", error);
    }
  };

  return (
    <div className="back-shadow">
      <form className="add-course-form" onSubmit={handleSubmit}>
        <h2>
          Luo uusi kurssi <span></span>
        </h2>
        <div className="add-course-form-content">
          <label>
            <span>Otsikko:</span>

            <input
              className="assignment-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              spellCheck="false"
            />
          </label>

          <div className="buttons">
            <button className="cancel-button" onClick={toggleAddCourseBox}>
              Peruuta
            </button>
            <button type="submit">Luo kurssi</button>
          </div>
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
