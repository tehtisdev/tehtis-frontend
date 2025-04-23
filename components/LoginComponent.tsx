import React from "react";
import { motion } from "framer-motion";
import "../style/Login.css";

interface LoginComponentProps {
  toggleRegister: () => void;
  handleLogin: (e: React.FormEvent) => void;
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  isPending: boolean;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({
  toggleRegister,
  handleLogin,
  email,
  password,
  setEmail,
  setPassword,
  isPending,
}) => {
  return (
    <>
      <div className="login-box">
        <div className="login-box-content" key="login">
          <h1>Tehtis</h1>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            Kirjaudu sisään jatkaaksesi
          </motion.h3>
          <form onSubmit={handleLogin}>
            <motion.div
              className="textbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <input
                className="login-input"
                type="text"
                placeholder="Sähköposti"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>
            <motion.div
              className="textbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <input
                className="login-input"
                type="password"
                placeholder="Salasana"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>
            {/*<p>{email + " " + password}</p>*/}
            <motion.button
              className="login-button"
              type="submit"
              disabled={isPending || email == "" || password == ""}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              Kirjaudu sisään
            </motion.button>
          </form>
          <motion.div
            className="no-account"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            <p>Eikö sinulla ole tiliä?</p>
            <a onClick={toggleRegister} className="register-link">
              Rekisteröidy
            </a>
          </motion.div>
        </div>
      </div>
    </>
  );
};
