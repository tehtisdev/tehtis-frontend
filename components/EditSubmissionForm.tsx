import React, { useState } from "react";
import { FormTextEditorComponent } from "./FormTextEditorComponent";

import "../style/EditSubmissionForm.css";

interface EditSubmissionFormProps {
  submissionId: number;
  description: string;
  toggleEditBox: () => void;
  updateSubmissions: () => void;
}

export const EditSubmissionForm = ({
  submissionId,
  description,
  toggleEditBox,
  updateSubmissions,
}: EditSubmissionFormProps) => {
  const [newDescription, setNewDescription] = useState(description);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/update-submission/${submissionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: newDescription,
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      updateSubmissions();
      toggleEditBox();
    } catch (error) {
      console.error("Error updating submission", error);
      alert("Palautuksen päivittäminen epäonnistui!");
    }
  };

  return (
    <>
      <div className="back-shadow">
        <form onSubmit={handleSubmit} className="edit-submission-form">
          <h2>Muokkaa palautusta</h2>

          <div className="" style={{ height: "15em", width: "100%" }}>
            <FormTextEditorComponent
              content={newDescription}
              setContent={setNewDescription}
            />
          </div>

          <div className="buttons">
            <button
              className="cancel-button"
              type="button"
              onClick={toggleEditBox}
            >
              Peruuta
            </button>
            <button type="submit">Tallenna</button>
          </div>
        </form>
      </div>
    </>
  );
};
