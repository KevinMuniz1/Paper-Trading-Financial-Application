import { useState, useEffect } from "react";
import "./AccountSettingsPage.css";
import NavBar from "../components/NavBar";
import { buildPath } from "../../Path";

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
      const userData = localStorage.getItem("user_data");
      if (!userData) {
        setMessageType("error");
        setMessage("Please log in first");
        setIsSaving(false);
        return;
      }

      const parsed = JSON.parse(userData);
      const userId = parsed.id;

      const updateData: Partial<AccountData> = {
        [editingField.field]: editingField.value.trim(),
      };

      const response = await fetch(buildPath("user/update"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...updateData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessageType("success");
        setMessage(`${editingField.field} updated successfully!`);
        setAccountData((prev) => ({
          ...prev,
          [editingField.field]: editingField.value.trim(),
        }));

        // Update localStorage
        parsed[editingField.field] = editingField.value.trim();
        localStorage.setItem("user_data", JSON.stringify(parsed));

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
        const userData = localStorage.getItem("user_data");
        if (!userData) {
          setMessage("Please log in first");
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        const parsed = JSON.parse(userData);
        const userId = parsed.id;

        const response = await fetch(buildPath("user/profile"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const userData = localStorage.getItem("user_data");
      if (!userData) {
        setMessageType("error");
        setMessage("Please log in first");
        setIsSaving(false);
        return;
      }

      const parsed = JSON.parse(userData);
      const userId = parsed.id;

      // TODO: Replace with your actual API endpoint
      const response = await fetch(buildPath("user/update"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          email: accountData.email,
        }),
      });

      if (response.ok) {
        setMessageType("success");
        setMessage("Account updated successfully!");
        
        // Update localStorage
        parsed.firstName = accountData.firstName;
        parsed.lastName = accountData.lastName;
        parsed.email = accountData.email;
        localStorage.setItem("user_data", JSON.stringify(parsed));
      } else {
        setMessageType("error");
        setMessage("Failed to update account. Please try again.");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("An error occurred. Please try again.");
      console.error("Error updating account:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
