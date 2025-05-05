import React, { useEffect, useState } from "react";
import "../style/root.css";
import "../style/Course.css";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import { TiUserDelete } from "react-icons/ti";

import { TextEditorComponent } from "./TextEditorComponent";
import { useAuth } from "../context/AuthContext";
import { defaultStyles, FileIcon } from "react-file-icon";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { AddSubmissionForm } from "./AddSubmissionForm";
import { EditSubmissionForm } from "./EditSubmissionForm";
import { MdOutlineDone } from "react-icons/md";

type Submission = {
  id: number;
  studentId: number;
  firstname: string;
  lastname: string;
  description: string;
  state: string;
};

export const CourseComponent = ({
  course,
  members,
  assignments,
  toggleAssignmentBox,
  toggleAddMembersBox,
  toggleRemoveMembersBox,
  onFileSubmit,
  courseFiles,
  deleteCourseFile,
  addFileToAssignment,
  assignmentFiles,
  deleteAssignmentFile,
  deleteAssignment,
}: {
  course: { id: number; name: string; description: string };
  members: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  }[];
  assignments: { id: number; title: string; description: string }[];
  toggleAssignmentBox: () => void;
  toggleAddMembersBox: () => void;
  toggleRemoveMembersBox: () => void;
  onFileSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  courseFiles: { id: number; filename: string; path: string }[];
  deleteCourseFile: (id: number) => void;
  addFileToAssignment: (
    id: number,
    event: React.FormEvent<HTMLFormElement>
  ) => void;
  assignmentFiles: { [key: number]: any[] };
  deleteAssignmentFile: (id: number, assignmentId: number) => void;
  deleteAssignment: (id: number) => void;
}) => {
  const { user } = useAuth();

  const [editorContent, setEditorContent] = useState(course.description);

  // odotetaan vähän aikaa, että saadaan data haettua
  useEffect(() => {
    const timer = setTimeout(() => {
      setEditorContent(course.description);
    }, 500);

    return () => clearTimeout(timer);
  }, [course.description]);

  const [toggleEdit, setToggleEdit] = useState(false);

  const handleEdit = () => {
    setToggleEdit(!toggleEdit);
  };

  // tallennetaan uusi muokattu kuvaus
  const saveNewDescription = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/update-course/${course.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: course.name,
            description: editorContent,
          }), // Include 'name' if required
        }
      );
      console.log(response.status);
    } catch (error) {
      console.error("Error updating course description", error);
    }
  };

  const navigate = useNavigate();

  const deleteCourse = async () => {
    if (
      !window.confirm(
        "Poistettua kurssia ei voida palauttaa. Haluatko varmasti poistaa kurssin?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/delete-course/${course.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting course", error);
    }
  };

  const [addSumbissionBox, setAddSubmissionBox] = useState(false);

  const toggleAddSubmissionBox = () => {
    setAddSubmissionBox(!addSumbissionBox);
  };

  const [currentAssignmentId, setCurrentAssignmentId] = useState(0);

  /*// haetaan tehtävän palautukset
app.get("/submissions/:assignmentId", (req, res) => {
  const { assignmentId } = req.params;
  const submissions = db
    .prepare("SELECT * FROM submissions WHERE assignmentId = ?")
    .all(assignmentId);

  res.json(submissions);
}); */

  const [editBox, setEditBox] = useState(false);

  const toggleEditBox = () => {
    setEditBox(!editBox);
  };

  const getSubmissionsForAssignment = async (assignmentId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/submissions/${assignmentId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting submissions for assignment", error);
    }
  };

  const [submissions, setSubmissions] = useState<
    { id: number; submissions: Submission[] }[]
  >([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const submissionsData = await Promise.all(
        assignments.map(async (assignment) => {
          const data = await getSubmissionsForAssignment(assignment.id);
          return { id: assignment.id, submissions: data };
        })
      );
      setSubmissions(submissionsData);
    };

    fetchSubmissions();
  }, [assignments]);

  const updateSubmissions = async () => {
    const submissionsData = await Promise.all(
      assignments.map(async (assignment) => {
        const data = await getSubmissionsForAssignment(assignment.id);
        return { id: assignment.id, submissions: data };
      })
    );
    setSubmissions(submissionsData);
  };

  const getSubmissionFiles = async (submissionId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/files/submission/${submissionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting submission files", error);
      return []; // return an empty array or appropriate fallback
    }
  };

  const [submissionFiles, setSubmissionFiles] = useState<{
    [submissionId: number]: any[];
  }>({});

  useEffect(() => {
    if (!submissions || submissions.length === 0) return;

    const fetchSubmissionFiles = async () => {
      try {
        const filesArray = await Promise.all(
          submissions
            .map((item) => item.submissions)
            .flat()
            .map(async (submission) => {
              if (!submission) return {};
              const files = await getSubmissionFiles(submission.id);
              return { [submission.id]: files };
            })
        );

        // Merge array of objects into a single object
        const filesObject = filesArray.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});

        setSubmissionFiles(filesObject);
      } catch (error) {
        console.error("Error fetching submission files", error);
      }
    };

    fetchSubmissionFiles();
  }, [submissions]);

  const [openSubmissionIds, setOpenSubmissionIds] = useState<number[]>([]);

  const toggleSubmission = (submissionId: number) => {
    setOpenSubmissionIds((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const uploadFile = async (submissionId: number) => {
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) return;

    const file = (fileInput as HTMLInputElement).files?.[0];
    if (!file) return;

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

      const files = await getSubmissionFiles(submissionId);
      setSubmissionFiles((prev) => ({
        ...prev,
        [submissionId]: files,
      }));
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      alert(`Tiedoston ${file.name} lataus epäonnistui!`);
    }
  };

  const deleteSubmissionFile = async (fileId: number, submissionId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/delete-submission-file/${fileId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const files = await getSubmissionFiles(submissionId);
      setSubmissionFiles((prev) => ({
        ...prev,
        [submissionId]: files,
      }));
    } catch (error) {
      console.error("Error deleting file", error);
      alert("Tiedoston poisto epäonnistui!");
    }
  };

  // vaihdetaan palautuksen tilaa
  const handleSubmissionStateChange = async (
    submissionId: number,
    newState: string
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/update-submission-state/${submissionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: newState }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update submission state");
      }

      updateSubmissions();
    } catch (error) {
      console.error("Error updating submission state", error);
    }
  };

  return (
    <motion.div
      className="course-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: 0.3 }}
    >
      <header className="course-header">
        <h1>{course.name}</h1>
        {user?.role === "teacher" && (
          <div className="course-actions">
            <button className="add-course-button" onClick={toggleAssignmentBox}>
              <FaPlus />
              <span>Lisää tehtävä</span>
            </button>
            <button
              className="add-members-button"
              onClick={toggleAddMembersBox}
            >
              <FaUserPlus />
              <span>Lisää osallistujia</span>
            </button>
            <button
              className="delete-members-button"
              onClick={toggleRemoveMembersBox}
            >
              <TiUserDelete /> <span>Poista osallistujia</span>
            </button>
            <button className="delete-course-button" onClick={deleteCourse}>
              <MdDeleteForever /> <span>Poista kurssi</span>
            </button>
          </div>
        )}

        <div className="course-subheader">
          <div
            className="course-description"
            style={user?.role === "student" ? { width: "70%" } : undefined}
          >
            {/* tekstieditori */}
            {toggleEdit && (
              <TextEditorComponent
                content={editorContent}
                setContent={setEditorContent}
              />
            )}
            <div className="description-content">
              {/* näytetään editorilla kirjoitettu sisältö */}
              {!toggleEdit && (
                <div className="saved-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: editorContent,
                    }}
                  />
                </div>
              )}
            </div>
            {user?.role === "teacher" &&
              (toggleEdit ? (
                <button
                  onClick={() => {
                    handleEdit();
                    saveNewDescription();
                  }}
                  type="button"
                >
                  Tallenna
                </button>
              ) : (
                <button
                  style={{ marginTop: "1em" }}
                  onClick={handleEdit}
                  type="button"
                >
                  Muokkaa
                </button>
              ))}
          </div>

          <div className="file-section">
            <h3>Kurssin liitetiedostot</h3>
            <div className="course-files">
              {courseFiles.length > 0 ? (
                <ul>
                  {courseFiles.map((file) => {
                    const extension =
                      file.filename.split(".").pop()?.toLowerCase() || "";
                    const style =
                      defaultStyles[extension as keyof typeof defaultStyles] ||
                      {};

                    return (
                      <li key={file.id}>
                        <FileIcon extension={extension} {...style} />

                        <a
                          href={`${import.meta.env.VITE_URL}/${file.path}`}
                          download
                        >
                          {file.filename.length > 5
                            ? `${file.filename.substring(0, 7)}...`
                            : file.filename}
                        </a>

                        {user?.role === "teacher" && (
                          <button onClick={() => deleteCourseFile(file.id)}>
                            Poista
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>Ei tiedostoja</p>
              )}
            </div>
            {user?.role === "teacher" && (
              <form
                style={{ padding: "1em" }}
                className="file-form"
                onSubmit={onFileSubmit}
              >
                <label className="file-label">
                  <h3>Lisää tiedosto kursille</h3>
                  <input type="file" name="file" required />
                  <button type="submit">Lähetä</button>
                </label>
              </form>
            )}
          </div>
          {user?.role === "teacher" && (
            <ul className="course-members">
              <h3>Osallistujat</h3>
              {members.map((member) => (
                <li style={{ gap: "0" }} className="member" key={member.id}>
                  <h4 className="member-name">{`${member.firstname} ${member.lastname}`}</h4>

                  <p style={{ marginBottom: "0" }} className="member-email">
                    {member.email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <h2 id="assignments-title">Tehtävät</h2>
      <ul className="assignment-list">
        {assignments.map((assignment) => (
          <li key={assignment.id}>
            <div className="assignment">
              <div className="assignment-info">
                <h2>
                  <strong>{assignment.title}</strong>
                </h2>
                <div className="assignment-desc">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: assignment.description,
                    }}
                  />
                </div>
              </div>

              {assignmentFiles[assignment.id]?.length > 0 && (
                <div className="assignment-files">
                  <h3>Tehtävän liitetiedostot</h3>
                  <ul>
                    {(assignmentFiles[assignment.id] || []).map((file) => {
                      const extension = file.filename
                        .split(".")
                        .pop() as string;
                      const style =
                        defaultStyles[
                          extension as keyof typeof defaultStyles
                        ] || {};

                      return (
                        <li key={file.id}>
                          <FileIcon extension={extension} {...style} />
                          <a
                            href={`${import.meta.env.VITE_URL}/${file.path}`}
                            download
                          >
                            {file.filename.length > 5
                              ? `${file.filename.substring(0, 7)}...`
                              : file.filename}
                          </a>
                          {user?.role === "teacher" && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteAssignmentFile(file.id, assignment.id)
                              }
                            >
                              Poista
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {user?.role === "teacher" && (
                <form
                  className="assignment-file-form"
                  onSubmit={(event) =>
                    addFileToAssignment(assignment.id, event)
                  }
                >
                  <label>
                    <h4>Lisää tiedosto tehtävään</h4>
                    <input type="file" name="file" required />
                    <button type="submit">Lähetä</button>
                  </label>
                </form>
              )}

              {(user?.role === "teacher" || user?.role === "student") &&
                (submissions ?? []).length > 0 && (
                  <>
                    {(submissions.find((item) => item.id === assignment.id)
                      ?.submissions?.length || 0) > 0 && (
                      <h3>
                        {user?.role === "teacher"
                          ? "Palautukset"
                          : "Oma palautus"}
                      </h3>
                    )}
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "1em",
                      }}
                    >
                      {(
                        submissions.find((item) => item.id === assignment.id)
                          ?.submissions || []
                      )
                        .filter((submission) => {
                          // jos käyttäjä on oppilas, näytetään vain omat palautukset
                          if (user?.role === "student") {
                            return submission.studentId === user.id;
                          }
                          // jos opettaja, näytetään kaikki palautukset
                          return true;
                        })
                        .map((submission) => {
                          const isOpen = openSubmissionIds.includes(
                            submission.id
                          );
                          return (
                            <li
                              key={submission.id}
                              className={`submission-item ${
                                isOpen ? "open" : "closed"
                              }`}
                              style={{
                                background: "var(--aliceblue)",
                                padding: "0.5em",
                                borderRadius: "15px",
                                width: "fit-content",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "fit-content",
                                  cursor: "pointer",
                                }}
                                onClick={() => toggleSubmission(submission.id)}
                              >
                                <h3 style={{ margin: 0 }}>
                                  {submission.firstname} {submission.lastname}
                                </h3>

                                <span
                                  style={{
                                    transform: isOpen
                                      ? "rotate(90deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 0.2s ease",
                                    paddingLeft: ".5em",
                                    scale: 1.3,
                                    color: "var(--black)",
                                  }}
                                >
                                  ➤
                                </span>
                              </div>
                              {user?.role === "teacher" && (
                                <>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "start",
                                      alignItems: "center",
                                      gap: ".5em",
                                    }}
                                  >
                                    <p>Palautuksen tila: </p>

                                    <select
                                      style={{
                                        fontSize: "1em",

                                        padding: ".5em",

                                        borderRadius: "15px",
                                        border: "2px solid black",

                                        width: "fit-content",
                                        backgroundColor:
                                          submission.state === "accepted"
                                            ? "var(--lightgreen)"
                                            : "var(--white)",
                                        color:
                                          submission.state === "accepted"
                                            ? "var(--black)"
                                            : "var(--black)",
                                      }}
                                      value={submission.state}
                                      onChange={(event) =>
                                        handleSubmissionStateChange(
                                          submission.id,
                                          event.target.value
                                        )
                                      }
                                    >
                                      <option value="submitted">
                                        Palautettu
                                      </option>
                                      <option value="accepted">
                                        Suoritettu
                                      </option>
                                    </select>
                                  </div>
                                </>
                              )}
                              {user?.role === "student" && (
                                <p>
                                  {submission.state === "accepted" ? (
                                    <span
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "1.1em",
                                        background: "aliceblue",
                                        padding: ".5em",
                                        borderRadius: "15px",
                                        fontWeight: "bold",
                                        marginTop: ".5em",
                                        width: "fit-content",
                                      }}
                                    >
                                      <MdOutlineDone
                                        style={{
                                          scale: 0.7,
                                          color: "var(--emerald)",
                                        }}
                                      />
                                      Suoritettu
                                    </span>
                                  ) : null}
                                </p>
                              )}

                              {isOpen && (
                                <div
                                  className="submission-content"
                                  style={{
                                    marginTop: "1em",
                                  }}
                                >
                                  <div
                                    style={{
                                      background: "white",
                                      borderRadius: "15px",
                                      padding: "1em",
                                      boxShadow: " 0 0 5px rgba(0, 0, 0, 0.1)",
                                    }}
                                    dangerouslySetInnerHTML={{
                                      __html: submission.description,
                                    }}
                                  />

                                  <div>
                                    {submissionFiles[submission.id]?.length >
                                      0 && (
                                      <h4
                                        style={{
                                          paddingLeft: ".2em",
                                          paddingTop: ".5em",
                                        }}
                                      >
                                        Palautuksen liitetiedostot
                                      </h4>
                                    )}

                                    <ul className="submission-files">
                                      {submissionFiles[submission.id] &&
                                        submissionFiles[submission.id].map(
                                          (file) => {
                                            if (!file || !file.filename)
                                              return null;

                                            const extension =
                                              file.filename
                                                .split(".")
                                                .pop()
                                                ?.toLowerCase() || "";
                                            const style =
                                              defaultStyles[
                                                extension as keyof typeof defaultStyles
                                              ] || {};

                                            return (
                                              <li
                                                className="submission-file"
                                                key={file.id}
                                              >
                                                <FileIcon
                                                  extension={extension}
                                                  {...style}
                                                />
                                                <a
                                                  href={`${
                                                    import.meta.env.VITE_URL
                                                  }/${file.path}`}
                                                  download
                                                >
                                                  {file.filename.length > 5
                                                    ? `${file.filename.substring(
                                                        0,
                                                        7
                                                      )}...`
                                                    : file.filename}
                                                </a>
                                                {user?.role === "student" && (
                                                  <button
                                                    onClick={() =>
                                                      deleteSubmissionFile(
                                                        file.id,
                                                        submission.id
                                                      )
                                                    }
                                                    style={{
                                                      backgroundColor:
                                                        "var(--bittersweet)",
                                                      padding: "0.5em",
                                                    }}
                                                  >
                                                    Poista
                                                  </button>
                                                )}
                                              </li>
                                            );
                                          }
                                        )}
                                    </ul>
                                    {user?.role === "student" && (
                                      <div className="submission-file-form">
                                        <form
                                          onSubmit={(event) => {
                                            event.preventDefault();
                                            uploadFile(submission.id);
                                          }}
                                        >
                                          <label>
                                            <h4>Liitä tiedosto palautukseen</h4>
                                            <input
                                              type="file"
                                              name="file"
                                              required
                                            />
                                            <button type="submit">
                                              Lähetä
                                            </button>
                                          </label>
                                        </form>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                    {user?.role === "teacher" && (
                      <button
                        style={{
                          alignSelf: "end",
                          padding: "0.5em",
                          background: "var(--bittersweet)",
                        }}
                        type="button"
                        onClick={() => deleteAssignment(assignment.id)}
                      >
                        <span>
                          <MdDeleteForever />
                        </span>

                        <p>Poista tehtävä</p>
                      </button>
                    )}
                  </>
                )}

              {user?.role === "student" &&
                (() => {
                  const assignmentSubmissions =
                    submissions.find((item) => item.id === assignment.id)
                      ?.submissions || [];

                  const hasSubmitted = assignmentSubmissions.some(
                    (submission) => submission.studentId === user.id
                  );

                  return !hasSubmitted ? (
                    <button
                      style={{
                        alignSelf: "start",
                        padding: "0.5em",
                        background: "var(--lightgreen)",
                      }}
                      type="button"
                      onClick={() => {
                        toggleAddSubmissionBox();
                        setCurrentAssignmentId(assignment.id);
                      }}
                    >
                      <p>Lisää palautus</p>
                    </button>
                  ) : (
                    <button
                      style={{
                        alignSelf: "start",
                        padding: "0.5em",
                        background: "var(--lightgreen)",
                      }}
                      type="button"
                      onClick={() => {
                        toggleEditBox();
                        setCurrentAssignmentId(assignment.id);
                      }}
                    >
                      <p>Muokkaa palautusta</p>
                    </button>
                  );
                })()}
            </div>
          </li>
        ))}
      </ul>

      {addSumbissionBox && (
        <AddSubmissionForm
          assignmentId={currentAssignmentId}
          toggleSubmissionBox={toggleAddSubmissionBox}
          updateSubmissions={updateSubmissions}
        />
      )}

      {editBox &&
        (() => {
          const submission = submissions
            .find((item) => item.id === currentAssignmentId)
            ?.submissions.find(
              (submission) => submission.studentId === user?.id
            );

          if (!submission?.id) return null;

          return (
            <EditSubmissionForm
              submissionId={submission.id}
              description={submission.description || ""}
              toggleEditBox={toggleEditBox}
              updateSubmissions={updateSubmissions}
            />
          );
        })()}
    </motion.div>
  );
};
