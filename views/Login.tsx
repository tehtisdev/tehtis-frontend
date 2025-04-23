import React, { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";
import { AnimatePresence } from "framer-motion";
import { RegisterComponent } from "../components/RegisterComponent";
import { LoginComponent } from "../components/LoginComponent";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

export const Login = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [register, setRegister] = useState(false);
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // tarkistetaan sessio, kun komponentti latautuu
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL}/session`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log("Session:", data);
        if (data.loggedIn) {
          setLoggedIn(true);
          console.log(loggedIn);
          login({
            id: data.userId,
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            role: data.role,
          }); // säilötään käyttäjän sessio
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkSession();
  }, [navigate, login]);

  // haetaan kaikki käyttäjät debuggaamista varten
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL}/users`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log("Fetched users:", data);
        setUsers(data);
        console.log(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const notify = () =>
    toast.success("Rekisteröityminen onnistui! Kirjaudutaan sisään...", {
      position: "top-center",
      autoClose: 2500,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  const [isPending, startTransition] = useTransition();

  // login-funktio, joka lähettää POST-pyynnön backendiin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      console.log("vite_url:", import.meta.env.VITE_URL);
      try {
        const response = await fetch(`${import.meta.env.VITE_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email: email.toLowerCase(), password }),
        });

        const data = await response.json();
        if (response.ok) {
          login({
            id: data.userId,
            email,
            role: data.role,
            firstname: data.firstname,
            lastname: data.lastname,
          });

          setLoggedIn(true);
          navigate("/dashboard");
        } else {
          alert(data.error || "Invalid credentials");
        }
      } catch (error) {
        alert("An error occurred while logging in");
        console.error(error);
      }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        // tehdään etu- ja sukunimen ensimmäinen kirjain isoksi ja loput pieniksi
        const capitalize = (s: string) =>
          s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

        const response = await fetch(`${import.meta.env.VITE_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            firstname: capitalize(firstname),
            lastname: capitalize(lastname),
            email: email.toLowerCase(),
            password,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          // rekisteröityminen onnistui, kirjaudutaan sisään luoduilla tunnuksilla
          // näytetään toast-viesti rekisteröitymisen onnistumisesta
          notify();
          // odotetaan 2,5 sekuntia ennen kuin kirjaudutaan sisään, jotta toast-viesti ehtii näkyä
          setTimeout(() => handleLogin(e), 2500);
        } else {
          alert(data.error || "Registration failed");
        }
      } catch (error) {
        alert("An error occurred while registering");
        console.error(error);
      }
    });
  };

  const toggleRegister = () => {
    setRegister(!register);
    // tyhjennetään input-kentät
    setFirstname("");
    setLastname("");
    setEmail("");
    setPassword("");
  };

  // näytetään tietosuojaseloste

  useEffect(() => {
    const privacyPolicyContent = document.querySelector(
      ".privacy-policy-content"
    ) as HTMLSpanElement;

    privacyPolicyContent.innerHTML = `${import.meta.env.VITE_PRIVACY_POLICY}`;

    privacyPolicyContent.classList.add("hidden");
  }, []);

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const togglePrivacyPolicy = () => {
    setShowPrivacyPolicy((prev) => {
      const newState = !prev;
      console.log(showPrivacyPolicy);
      const privacyPolicyContent = document.querySelector(
        ".privacy-policy-content"
      ) as HTMLSpanElement;

      if (newState) {
        privacyPolicyContent.classList.remove("hidden");
      } else {
        privacyPolicyContent.classList.add("hidden");
      }

      return newState;
    });
  };

  return (
    <>
      <div className="container">
        <div className="login-box">
          <AnimatePresence mode="wait">
            {register ? (
              <RegisterComponent
                toggleRegister={toggleRegister}
                firstname={firstname}
                setFirstname={setFirstname}
                lastname={lastname}
                setLastname={setLastname}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleRegister={handleRegister}
                isPending={isPending}
              />
            ) : (
              <LoginComponent
                email={email}
                password={password}
                setEmail={setEmail}
                setPassword={setPassword}
                handleLogin={handleLogin}
                toggleRegister={toggleRegister}
                isPending={isPending}
              />
            )}
          </AnimatePresence>
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
        <div className="privacy-policy">
          <h3 onClick={togglePrivacyPolicy}>Tietosuojaseloste</h3>
          <span className="privacy-policy-content"></span>
        </div>
      </div>
    </>
  );
};
