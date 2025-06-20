import React, { useState } from "react";
import "./login.css";
import Login from "../../assets/login.png";
import EyeSvg from "../../assets/eye.svg";
import EyeHiddenSvg from "../../assets/eye-hidden.svg";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (field) => {
    if (field === "password") setShowPassword(!showPassword);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form submitted:", formData);
  };

  const isFormValid = () => {
    return formData.email.trim() !== "" && formData.password.trim() !== "";
  };

  return (
    <div className="login-container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon"></div>
          <span className="logo-text">LOGO</span>
        </div>
      </header>

      <main className="main-content-login">
        <div className="content-wrapper">
          <div className="dashboard-section">
            <div className="dashboard-mockup">
              <div className="mockup-placeholder">
                <img
                  src={Login}
                  alt="Dashboard Mockup"
                  className="mockup-image"
                />
              </div>
            </div>
            <div className="dashboard-text">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur.
              </p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-container">
              <h1 className="form-title">Welcome to Dashboard</h1>

              <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address<span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password<span className="required-star">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                    <span
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("password")}
                    >
                      <img
                        src={showPassword ? EyeHiddenSvg : EyeSvg}
                        alt={showPassword ? "Hide password" : "Show password"}
                        width="20"
                        height="20"
                      />
                    </span>
                  </div>
                </div>
                <div className="forgot-password">
                  <a href="/forgot-password" className="link-forget">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="signup-button"
                  disabled={!isFormValid()}
                >
                  Login
                </button>

                <div className="login-link">
                  <p>
                    Do not have an account?{" "}
                    <a href="/register" className="link">
                      Register
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
