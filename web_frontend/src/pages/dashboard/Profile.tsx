import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { HALLS, type HallId } from "../../constant/halls";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

// ─── Types ────────────────────────────────────────────────────────────────────

// Editable fields: name, password, preferred_hall_id
// Read-only fields: roll, email, gender, wallet_balance, account_created_date
type EditableField = "name" | "password" | "hall";

// ─── Component ────────────────────────────────────────────────────────────────

const Profile = () => {
  const { user, token, updateUser } = useAuth();

  // কোন field এখন edit mode এ আছে (null = কোনোটাই না)
  const [editing, setEditing] = useState<EditableField | null>(null);

  // Edit এর temporary values
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newHallId, setNewHallId] = useState<HallId>(HALLS[0].id);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null; // ProtectedRoute থাকায় এটা normally হবে না

  // Edit শুরু করো — field এর current value দিয়ে pre-fill
  const startEdit = (field: EditableField) => {
    setError("");
    if (field === "name") setNewName(user.name);
    if (field === "hall") setNewHallId((user.preferred_hall_id as HallId) ?? HALLS[0].id);
    if (field === "password") { setNewPassword(""); setConfirmPassword(""); }
    setEditing(field);
  };

  const cancelEdit = () => {
    setEditing(null);
    setError("");
  };

  // ── Save name ──
  const saveName = async () => {
    if (!newName.trim()) return setError("Name cannot be empty.");
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/update-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update name");

      updateUser({ name: newName.trim() }); // AuthContext + localStorage update
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update name");
    } finally {
      setBusy(false);
    }
  };

  // ── Save password ──
  const savePassword = async () => {
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(newPassword)) {
      return setError("Password must be at least 6 characters with one letter and one digit.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setBusy(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
        // Server: updated_at ও update করবে
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");

      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password");
    } finally {
      setBusy(false);
    }
  };

  // ── Save preferred hall ──
  const saveHall = async () => {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/update-hall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferred_hall_id: newHallId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update hall");

      updateUser({ preferred_hall_id: newHallId }); // AuthContext update
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update hall");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    if (editing === "name") return saveName();
    if (editing === "password") return savePassword();
    if (editing === "hall") return saveHall();
  };

  // ── Render ──
  // Available:
  //   READ-ONLY:  user.roll, user.ruet_stdn_mail, user.gender,
  //               user.wallet_balance, user.account_creted_date
  //   EDITABLE:   user.name → startEdit("name")
  //               user.preferreable_hall_id → startEdit("hall")
  //               password → startEdit("password")
  //   EDIT STATE: editing, newName, setNewName, newPassword, setNewPassword,
  //               confirmPassword, setConfirmPassword, newHallId, setNewHallId,
  //               error, busy, handleSave, cancelEdit, HALLS
  return (
    <div>
      {/* তোমার UI এখানে */}

      {/* Read-only fields */}
      <p>Roll: {user.roll}</p>
      <p>Email: {user.email}</p>
      <p>Gender: {user.gender}</p>
      <p>Wallet: ৳ {user.wallet_balance.toFixed(2)}</p>
      {/* <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p> */}

      {/* Editable: Name */}
      <div>
        <p>Name: {user.name}</p>
        {editing !== "name" && (
          <button type="button" onClick={() => startEdit("name")}>Edit</button>
        )}
        {editing === "name" && (
          <>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button type="button" onClick={handleSave} disabled={busy}>Save</button>
            <button type="button" onClick={cancelEdit}>Cancel</button>
          </>
        )}
      </div>

      {/* Editable: Password */}
      <div>
        <p>Password: ••••••</p>
        {editing !== "password" && (
          <button type="button" onClick={() => startEdit("password")}>Change</button>
        )}
        {editing === "password" && (
          <>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
            <button type="button" onClick={handleSave} disabled={busy}>Save</button>
            <button type="button" onClick={cancelEdit}>Cancel</button>
          </>
        )}
      </div>

      {/* Editable: Preferred Hall */}
      <div>
        <p>Preferred Hall: {user.preferred_hall_id ?? "Not set"}</p>
        {editing !== "hall" && (
          <button type="button" onClick={() => startEdit("hall")}>Edit</button>
        )}
        {editing === "hall" && (
          <>
            <select value={newHallId} onChange={(e) => setNewHallId(e.target.value as HallId)}>
              {HALLS.map((hall) => (
                <option key={hall.id} value={hall.id}>{hall.name}</option>
              ))}
            </select>
            <button type="button" onClick={handleSave} disabled={busy}>Save</button>
            <button type="button" onClick={cancelEdit}>Cancel</button>
          </>
        )}
      </div>

      {error && <p>{error}</p>}
    </div>
  );
};

export default Profile;