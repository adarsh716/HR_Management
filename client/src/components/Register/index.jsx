import React, { useState } from "react";
import "../Login/login.css";
import DashboardSvg from "../../assets/login.png";
import EyeSvg from "../../assets/eye.svg";
import EyeHiddenSvg from "../../assets/eye-hidden.svg";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const togglePasswordVisibility = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    if (field === "confirmPassword") setShowConfirmPassword(!showConfirmPassword);
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
                <img src={DashboardSvg} alt="Dashboard Mockup" className="mockup-image" />
              </div>
            </div>
            <div className="dashboard-text">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur.
              </p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-container">
              <h1 className="form-title">Welcome to Dashboard</h1>

              <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name<span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

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

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password<span className="required-star">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                    <span
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                    >
                      <img
                        src={showConfirmPassword ? EyeHiddenSvg : EyeSvg}
                        alt={showConfirmPassword ? "Hide password" : "Show password"}
                        width="20"
                        height="20"
                      />
                    </span>
                  </div>
                </div>

                <button type="submit" className="signup-button">
                  Register
                </button>

                <div className="login-link">
                  <p>
                    Already have an account? <a href="/login" className="link">
                      Login
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