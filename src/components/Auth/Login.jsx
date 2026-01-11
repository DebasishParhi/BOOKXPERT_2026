import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";  // Import CSS module

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (user === "admin" && pass === "admin") {
      login();
      navigate("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Login</h2>
        <input
          placeholder="Username"
          value={user}
          onChange={e => setUser(e.target.value)}
          className={styles.input}
          autoComplete="username"
          aria-label="Username"
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          className={styles.input}
          autoComplete="current-password"
          aria-label="Password"
        />
        <button onClick={handleLogin} className={styles.button} type="button">
          Login
        </button>
      </div>
    </div>
  );
}
