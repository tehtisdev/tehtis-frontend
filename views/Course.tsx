import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import { NavComponent } from "../components/NavComponent";
import "../style/root.css";
import { CourseComponent } from "../components/CourseComponent";
import { AssignmentForm } from "../components/AssignmentForm";
import { AddMembersForm } from "../components/AddMembersForm";
import { RemoveMembersForm } from "../components/RemoveMembersForm";

export const Course = () => {
  const { id } = useParams(); // haetaan kurssin ID osoitteesta
  const [course, setCourse] = useState<any>({});
  const [members, setMembers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const getCourseInfo = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/course-info/${id}`
      );
      const data = await response.json();

      setCourse(data);
    } catch (error) {
      console.error("Error fetching course info", error);
    }
  };

  const getCourseMembers = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/course-members/${id}`
      );
      const data = await response.json();

      setMembers(data);
    } catch (error) {
      console.error("Error fetching course members", error);
    }
  };

  const getCourseAssignments = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/course-assignments/${id}`
      );
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching course assignments", error);
    }
  };

  useEffect(() => {
    if (id) {
      getCourseInfo(id);
      getCourseMembers(id);
      getCourseAssignments(id);
    }
  }, [id]); // Fetch course info whenever the id changes

  const [assignmentBox, setAssignmentBox] = useState(false);

  const toggleAssignmentBox = () => {
    setAssignmentBox(!assignmentBox);
  };

  const [addMembersBox, setAddMembersBox] = useState(false);

  const toggleAddMembersBox = () => {
    setAddMembersBox(!addMembersBox);
  };

  const [removeMembersBox, setRemoveMembersBox] = useState(false);

  const toggleRemoveMembersBox = () => {
    setRemoveMembersBox(!removeMembersBox);
  };

  const onFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/upload/course/${id}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      getCourseFiles(id!);
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Tiedoston lähetys epäonnistui!");
    }
  };

  const [courseFiles, setCourseFiles] = useState<any[]>([]);

  const getCourseFiles = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/files/course/${id}`
      );
      const data = await response.json();
      setCourseFiles(data);
    } catch (error) {
      console.error("Error fetching course files", error);
    }
  };

  useEffect(() => {
    if (id) {
      getCourseFiles(id);
    }
  }, [id]); // Fetch course info whenever the id changes

  const deleteCourseFile = async (fileId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/delete-file/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      getCourseFiles(id!);
    } catch (error) {
      console.error("Error deleting file", error);
      alert("Tiedoston poisto epäonnistui!");
    }
  };

  const [assignmentFiles, setAssignmentFiles] = useState<{
    [key: number]: any[];
  }>({});

  const getAssignmentFiles = async (assignmentId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/files/assignment/${assignmentId}`
      );
      const data = await response.json();

      setAssignmentFiles((prev) => ({
        ...prev,
        [assignmentId]: data, // Store files under assignmentId
      }));
    } catch (error) {
      console.error("Error fetching assignment files", error);
    }
  };

  useEffect(() => {
    assignments.forEach((assignment) => {
      getAssignmentFiles(assignment.id);
    });
  }, [assignments]);

  const addFileToAssignment = async (
    assignmentId: number,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/upload/assignment/${assignmentId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      getAssignmentFiles(assignmentId);
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Tiedoston lähetys epäonnistui!");
    }
  };

  const deleteAssignmentFile = async (fileId: number, assignmentId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/delete-file/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      getAssignmentFiles(assignmentId);
    } catch (error) {
      console.error("Error deleting file", error);
      alert("Tiedoston poisto epäonnistui!");
    }
  };

  const deleteAssignment = async (assignmentId: number) => {
    try {
      if (
        window.confirm(
          "Poistettua tehtävää ei voida palauttaa, haluatko varmasti poistaa tehtävän?"
        )
      ) {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/delete-assignment/${assignmentId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        getCourseAssignments(id!);
      }
    } catch (error) {
      console.error("Error deleting assignment", error);
      alert("Tehtävän poisto epäonnistui!");
    }
  };

  return (
    <>
      <div className="container">
        <div className="nav-background"></div>
        <NavComponent />
        <CourseComponent
          course={course}
          members={members}
          assignments={assignments}
          toggleAssignmentBox={toggleAssignmentBox}
          toggleAddMembersBox={toggleAddMembersBox}
          toggleRemoveMembersBox={toggleRemoveMembersBox}
          onFileSubmit={onFileSubmit}
          courseFiles={courseFiles}
          deleteCourseFile={deleteCourseFile}
          addFileToAssignment={addFileToAssignment}
          assignmentFiles={assignmentFiles}
          deleteAssignmentFile={deleteAssignmentFile}
          deleteAssignment={deleteAssignment}
        />

        {assignmentBox && (
          <AssignmentForm
            toggleAssignmentBox={toggleAssignmentBox}
            courseId={parseInt(id || "0")}
            onAssignmentAdded={() => getCourseAssignments(id!)}
          />
        )}

        {addMembersBox && (
          <AddMembersForm
            toggleAddMembersBox={toggleAddMembersBox}
            course={course}
            onMembersAdded={() => getCourseMembers(id!)}
          />
        )}

        {removeMembersBox && (
          <RemoveMembersForm
            toggleRemoveMembersBox={toggleRemoveMembersBox}
            course={course}
            courseAssignments={assignments}
            onMembersRemoved={() => getCourseMembers(id!)}
          />
        )}
      </div>
    </>
  );
};
