import React from "react";
import "../style/Dashboard.css";
import "../style/root.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { FaPlusCircle } from "react-icons/fa";

interface DashboardComponentProps {
  courses: any[];
  user: { id: number; role: string; firstname: string; email: string } | null;
  toggleAddCourseBox: () => void;
}

export const DashboardComponent: React.FC<DashboardComponentProps> = ({
  courses,
  user,
  toggleAddCourseBox,
}) => {
  return (
    <>
      <motion.div
        className="dashboard-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <h1>Etusivu</h1>
        <p>
          Hei {user?.firstname}! Tämä on etusivu. Täältä löydät listan
          kursseista, joihin olet osallistunut.
        </p>

        {user?.role === "admin" && (
          <div className="admin-panel-link">
            <h3>
              Hei admin! Avaa <Link to="/adminpanel">Hallintapaneeli</Link>
            </h3>
          </div>
        )}

        <div className="courses">
          <h2>Kurssit</h2>
          {user?.role === "teacher" && (
            <button
              type="button"
              className="new-course-button"
              onClick={toggleAddCourseBox}
            >
              <FaPlusCircle /> Luo uusi kurssi
            </button>
          )}
          <div className="course-list">
            {courses.length > 0 ? (
              courses
                .filter((course) => course && course.name) // Remove null/undefined items
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort safely
                .map((course) => (
                  <Link to={`/course/${course.id}`} key={course.id}>
                    <div className="course">
                      <h3>
                        {course.name.length > 80
                          ? `${course.name.slice(0, 80)}...`
                          : course.name}
                      </h3>
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          backgroundColor: "var(--aliceblue)",
                          borderRadius: "5px",
                          padding: "5px",
                          marginBottom: "1em",
                          overflow: "hidden",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: course.description,
                        }}
                      />
                    </div>
                  </Link>
                ))
            ) : (
              <p>Ei kursseja tällä hetkellä.</p>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};
