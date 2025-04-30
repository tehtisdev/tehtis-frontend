import React, { useState } from "react";
import { FormTextEditorComponent } from "./FormTextEditorComponent";
import "../style/root.css";
import "../style/AssignmentForm.css";
import { useAuth } from "../context/AuthContext";
import { defaultStyles, FileIcon } from "react-file-icon";
import { MdDeleteForever } from "react-icons/md";

interface AddSubmissionFormProps {
  assignmentId: number;
  toggleSubmissionBox: () => void;
  updateSubmissions: () => void;
}

export const AddSubmissionForm = ({
  assignmentId,
  toggleSubmissionBox,
  updateSubmissions,
}: AddSubmissionFormProps) => {
  const { user } = useAuth();
  const [description, setDescription] = useState("");

  const [files, setFiles] = useState<File[]>([]);

  console.log("assignmentId", assignmentId);
  console.log("description", description);
  console.log("studentId", user?.id);

  const addNewFile = (event: React.FormEvent) => {
    event.preventDefault();
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      const file = (fileInput as HTMLInputElement).files?.[0];
      if (file) {
        setFiles([...files, file]);
      }
    }
  };

  const uploadFiles = async (submissionId: number) => {
    for (const file of files) {
      const fileData = new FormData();
      fileData.append("file", file);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/upload/submission/${submissionId}`,
          {
            method: "POST",
            body: fileData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        console.log(`File ${file.name} uploaded successfully`);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        alert(`Tiedoston ${file.name} lataus epäonnistui!`);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("assignmentId", assignmentId.toString());
    formData.append("description", description);
    formData.append("firstname", user?.firstname || "");
    formData.append("lastname", user?.lastname || "");
    formData.append("studentId", user?.id?.toString() || "");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/submit-assignment`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const submissionId = result.submissionId; // tallennetaan submissionId muuttujaan

      // ladataan tiedostot palvelimelle
      await uploadFiles(submissionId);

      console.log("assignmentId", assignmentId);
      updateSubmissions();
      toggleSubmissionBox();
    } catch (error) {
      console.error("Error adding submission", error);
      alert("Palautuksen lisääminen epäonnistui!");
    }
  };

  return (
    <>
      <div className="back-shadow">
        <form onSubmit={handleSubmit} className="submissionform">
          <h2 style={{ margin: "0" }}>Lisää palautus</h2>

          <p style={{ margin: "0", padding: "0", fontStyle: "italic" }}>
            Palautusta voi muokata lisäämisen jälkeen.
          </p>

          <div style={{ maxHeight: "10em", width: "100%" }}>
            <FormTextEditorComponent
              content={description}
              setContent={setDescription}
            />
          </div>

          <div className="submission-file-manager">
            {files.length > 0 ? (
              <form className="file-form">
                <label className="file-label">
                  <h3>Liitä tiedosto palautukseen</h3>
                  <input type="file" name="file" required />
                  <button
                    type="button"
                    style={{ padding: "0.5em" }}
                    onClick={addNewFile}
                  >
                    Lähetä
                  </button>
                </label>
              </form>
            ) : (
              <form style={{ marginTop: "11em" }} className="file-form">
                <label className="file-label">
                  <h3>Liitä tiedosto palautukseen</h3>
                  <input type="file" name="file" required />
                  <button
                    type="button"
                    style={{ padding: "0.5em" }}
                    onClick={addNewFile}
                  >
                    Lähetä
                  </button>
                </label>
              </form>
            )}

            {files.length > 0 && (
              <div className="file-container">
                <h4>Liitetiedostot</h4>
                <ul
                  style={files.length > 3 ? { overflowY: "scroll" } : undefined}
                >
                  {files.length > 0 &&
                    files.map((file, index) => {
                      const extension = file.name.split(".").pop();
                      const style =
                        defaultStyles[
                          extension as keyof typeof defaultStyles
                        ] || {};

                      return (
                        <li>
                          <FileIcon extension={extension} {...style} />
                          <p>
                            {" "}
                            {file.name.length > 5
                              ? `${file.name.substring(0, 7)}...`
                              : file.name}
                          </p>
                          <button
                            type="button"
                            style={{ padding: "0.5em" }}
                            onClick={() => {
                              setFiles(files.filter((_, i) => i !== index));
                            }}
                          >
                            <MdDeleteForever className="add-submission-file-delete-icon" />
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </div>

          <div className="buttons">
            <button
              className="cancel-button"
              type="button"
              onClick={toggleSubmissionBox}
            >
              Peruuta
            </button>
            <button type="submit">Lisää palautus</button>
          </div>
        </form>
      </div>
    </>
  );
};
