import { useState, useEffect } from "react";
import "./AccountSettingsPage.css";
import NavBar from "../components/NavBar";
import { buildPath } from "../../Path";
import { useAuth } from '../context/AuthContext'; 

interface AccountData {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
}

interface EditingField {
  field: keyof AccountData | null;
  value: string;
}

const AccountSettingsPage = () => {
  const { user, token } = useAuth();
  const [accountData, setAccountData] = useState<AccountData>({
    firstName: "",
    lastName: "",
    email: "",
    login: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editingField, setEditingField] = useState<EditingField>({
    field: null,
    value: "",
  });

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState<"success" | "error" | "">("");

  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const startEdit = (field: keyof AccountData) => {
    setEditingField({
      field,
      value: accountData[field],
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingField({ field: null, value: "" });
  };

  const saveField = async () => {
    if (!editingField.field) return;

    if (!editingField.value.trim()) {
      setMessage("Field cannot be empty");
      setMessageType("error");
      return;
    }

    if (editingField.value === accountData[editingField.field]) {
      setMessage("No changes made");
      setMessageType("error");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      if (!user || !token) {
        setIsSaving(false);
        return;
      }

      const userId = user.userId;
      const field = editingField.field;

      // Map frontend field names to backend field names
      const fieldMappings = {
        firstName: "firstName", // Backend handles both camelCase and PascalCase
        lastName: "lastName",
        email: "email", 
        login: "login" // Backend expects 'login' for username
      };

      const backendFieldName = fieldMappings[field];
      const updateData = {
        userId: userId,
        [backendFieldName]: editingField.value.trim(),
      };

      console.log("Sending update data:", updateData);

      const response = await fetch(buildPath("user/update"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setMessageType("success");
        const field = editingField.field as keyof AccountData;
        setMessage(`${field} updated successfully!`);
        setAccountData((prev) => ({
          ...prev,
          [field]: editingField.value.trim(),
        }));

        // Update localStorage
        /*
        const updatedUserData = {
          ...parsed,
          [field]: editingField.value.trim(),
        };
        localStorage.setItem("user_data", JSON.stringify(updatedUserData));
        */
       //update authcontext
      
        setEditingField({ field: null, value: "" });
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to update field");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("An error occurred. Please try again.");
      console.error("Error updating field:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordMessage("");

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage("All fields are required");
      setPasswordMessageType("error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match");
      setPasswordMessageType("error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters");
      setPasswordMessageType("error");
      return;
    }

    try {
      if (!user || !token) {
        return;
      }

      const userId = user.userId;
      const response = await fetch(buildPath("user/change-password"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordMessageType("success");
        setPasswordMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordChange(false);
      } else {
        setPasswordMessageType("error");
        setPasswordMessage(data.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordMessageType("error");
      setPasswordMessage("An error occurred. Please try again.");
      console.error("Error changing password:", error);
    }
  };

  // Handle password reset request
  const handlePasswordReset = async () => {
    try {
      const response = await fetch(buildPath("forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: accountData.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Password reset email sent! Check your inbox.");
        setMessageType("success");
      } else {
        setMessage("Failed to send reset email");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
      console.error("Error requesting password reset:", error);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteMessage("Please enter your password to confirm");
      return;
    }

    try {
      if (!user || !token) {
        return;
      }

      const userId = user.userId;

      const response = await fetch(buildPath("user/delete"), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear localStorage and redirect to login
        localStorage.removeItem("user_data");
        window.location.href = "/";
      } else {
        setDeleteMessage(data.error || "Failed to delete account");
      }
    } catch (error) {
      setDeleteMessage("An error occurred. Please try again.");
      console.error("Error deleting account:", error);
    }
  };

  const getFieldLabel = (field: keyof AccountData) => {
    const labels: Record<keyof AccountData, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      login: "Username",
    };
    return labels[field];
  };

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        if (!user || !token) {
          setIsLoading(false);
          return;
        }

        const userId = user.userId;

        const response = await fetch(buildPath("user/profile"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId  }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        if (data.error) {
          setMessage(data.error);
          setMessageType("error");
        } else {
          setAccountData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            login: data.login || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Failed to load user data");
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, token]);

  return (
    <div className="account-settings-page">
      <NavBar />

      <div className="account-settings-container">
        <div className="settings-content">
          <h1>Account Settings</h1>
          <p className="settings-subtitle">Manage your account information</p>

          {isLoading ? (
            <div className="loading-state">
              <p>Loading your account information...</p>
            </div>
          ) : (
            <>
              {/* Account Information Section */}
              <div className="settings-section">
                <h2>Account Information</h2>
                <div className="settings-table">
                  {(["login", "firstName", "lastName", "email"] as const).map(
                    (field) => (
                      <div key={field} className="settings-row">
                        <div className="field-label">
                          <span className="label-text">{getFieldLabel(field)}</span>
                        </div>

                        {editingField.field === field ? (
                          <div className="field-edit">
                            <input
                              type={field === "email" ? "email" : "text"}
                              value={editingField.value}
                              onChange={(e) =>
                                setEditingField({
                                  ...editingField,
                                  value: e.target.value,
                                })
                              }
                              placeholder={`Enter new ${getFieldLabel(field).toLowerCase()}`}
                              className="edit-input"
                            />
                            <button
                              onClick={saveField}
                              disabled={isSaving}
                              className="save-btn"
                            >
                              {isSaving ? "..." : "Submit"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isSaving}
                              className="cancel-btn"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="field-display">
                            <span className="field-value">
                              {accountData[field] || "Not set"}
                            </span>
                            <button
                              onClick={() => startEdit(field)}
                              className="change-btn"
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Password Management Section */}
              <div className="settings-section">
                <h2>Password & Security</h2>
                
                {/* Change Password */}
                <div className="password-section">
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="section-toggle-btn"
                  >
                    {showPasswordChange ? "Cancel Password Change" : "Change Password"}
                  </button>

                  {showPasswordChange && (
                    <div className="password-change-form">
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="password-input"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="password-input"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="password-input"
                      />
                      <button onClick={handlePasswordChange} className="submit-password-btn">
                        Update Password
                      </button>
                    </div>
                  )}

                  {passwordMessage && (
                    <div className={`message ${passwordMessageType}`}>
                      {passwordMessage}
                    </div>
                  )}
                </div>

                {/* Password Reset */}
                <div className="password-reset-section">
                  <p className="reset-description">Forgot your password? We'll send you a reset link.</p>
                  <button onClick={handlePasswordReset} className="reset-password-btn">
                    Send Password Reset Email
                  </button>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="settings-section danger-section">
                <h2>Delete Account</h2>
                <p className="danger-warning">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="delete-account-btn"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="delete-confirm-form">
                    <p className="confirm-text">Enter your password to confirm account deletion:</p>
                    <input
                      type="password"
                      placeholder="Your Password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="delete-password-input"
                    />
                    <div className="delete-actions">
                      <button onClick={handleDeleteAccount} className="confirm-delete-btn">
                        Yes, Delete My Account
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword("");
                          setDeleteMessage("");
                        }}
                        className="cancel-delete-btn"
                      >
                        Cancel
                      </button>
                    </div>
                    {deleteMessage && (
                      <div className="message error">{deleteMessage}</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;