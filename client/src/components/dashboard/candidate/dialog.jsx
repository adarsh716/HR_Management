import { useState, useContext } from "react";
import resumeuploadIcon from "../../../assets/Resume-upload.svg";
import { AuthContext } from "../../../context/AuthContext";

export default function AddCandidateDialog({
  isOpen,
  onClose,
  newCandidate,
  onInputChange,
  onFileChange,
  onCheckboxChange,
  onAddCandidate,
}) {
  const { error } = useContext(AuthContext);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    phone: false,
    position: false,
    experience: false,
  });

  const handleFileClear = () => {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
    onFileChange({ target: { files: [] } });
  };

  if (!isOpen) return null;

  return (
    <div className="custom-dialog-overlay">
      <div className="custom-dialog">
        <div className="custom-dialog-header">
          <span>Add New Candidate</span>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="custom-dialog-body">
          <div className="form-grid">
            <div className="input-group">
              <input
                type="text"
                name="name"
                className="dialog-input"
                value={newCandidate.name}
                onChange={onInputChange}
                onFocus={() => setIsFocused((prev) => ({ ...prev, name: true }))}
                onBlur={() => setIsFocused((prev) => ({ ...prev, name: !newCandidate.name && false }))}
              />
              <label className={`input-label ${newCandidate.name || isFocused.name ? "active" : ""}`}>
                Full Name*
              </label>
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                className="dialog-input"
                value={newCandidate.email}
                onChange={onInputChange}
                onFocus={() => setIsFocused((prev) => ({ ...prev, email: true }))}
                onBlur={() => setIsFocused((prev) => ({ ...prev, email: !newCandidate.email && false }))}
              />
              <label className={`input-label ${newCandidate.email || isFocused.email ? "active" : ""}`}>
                Email Address*
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="phone"
                className="dialog-input"
                value={newCandidate.phone}
                onChange={onInputChange}
                onFocus={() => setIsFocused((prev) => ({ ...prev, phone: true }))}
                onBlur={() => setIsFocused((prev) => ({ ...prev, phone: !newCandidate.phone && false }))}
              />
              <label className={`input-label ${newCandidate.phone || isFocused.phone ? "active" : ""}`}>
                Phone Number*
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="position"
                className="dialog-input"
                value={newCandidate.position}
                onChange={onInputChange}
                onFocus={() => setIsFocused((prev) => ({ ...prev, position: true }))}
                onBlur={() => setIsFocused((prev) => ({ ...prev, position: !newCandidate.position && false }))}
              />
              <label className={`input-label ${newCandidate.position || isFocused.position ? "active" : ""}`}>
                Position*
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                name="experience"
                className="dialog-input"
                value={newCandidate.experience}
                onChange={onInputChange}
                onFocus={() => setIsFocused((prev) => ({ ...prev, experience: true }))}
                onBlur={() => setIsFocused((prev) => ({ ...prev, experience: !newCandidate.experience && false }))}
              />
              <label className={`input-label ${newCandidate.experience || isFocused.experience ? "active" : ""}`}>
                Experience*
              </label>
            </div>
            <label className="dialog-upload" style={{ height: "48px" }}>
              {newCandidate.resume ? (
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {newCandidate.resume.name}
                  </span>
                  <button
                    onClick={handleFileClear}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <span>Resume*</span>
                  <input type="file" accept="application/pdf" hidden onChange={onFileChange} />
                  <span className="upload-icon"><img src={resumeuploadIcon} alt="resume upload" /></span>
                </>
              )}
            </label>
          </div>

          <div className="declaration-row">
            <input
              type="checkbox"
              id="declaration"
              checked={newCandidate.accepted}
              onChange={onCheckboxChange}
            />
            <label htmlFor="declaration">
              I hereby declare that the above information is true to the best of my knowledge and belief
            </label>
          </div>

          <button
            className="save-button"
            onClick={onAddCandidate}
            disabled={!newCandidate.accepted}
          >
            Save
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}