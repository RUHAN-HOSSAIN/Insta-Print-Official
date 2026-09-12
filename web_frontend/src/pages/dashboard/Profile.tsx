import { useState } from "react";
import { ArrowLeft, Edit3, LockKeyhole, MapPin, Save, UserRound, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { HALLS, type HallId } from "../../constant/halls";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newHallId, setNewHallId] = useState<HallId>(HALLS[0].id);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const startEdit = () => {
    setError("");
    setNewName(user.name);
    setNewHallId((user.preferred_hall_id as HallId) ?? HALLS[0].id);
    setNewPassword("");
    setConfirmPassword("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!newName.trim()) return setError("Name cannot be empty.");
    if (newPassword && !/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(newPassword)) {
      return setError("Password must be at least 6 characters with one letter and one digit.");
    }
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");

    setBusy(true);
    setError("");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    try {
      const nameResponse = await fetch(`${API_BASE_URL}/api/user/update-name`, {
        method: "POST", headers, body: JSON.stringify({ name: newName.trim() }),
      });
      const nameData = await nameResponse.json().catch(() => ({}));
      if (!nameResponse.ok) throw new Error(nameData.error ?? "Failed to update name");

      const hallResponse = await fetch(`${API_BASE_URL}/api/user/update-hall`, {
        method: "POST", headers, body: JSON.stringify({ preferred_hall_id: newHallId }),
      });
      const hallData = await hallResponse.json().catch(() => ({}));
      if (!hallResponse.ok) throw new Error(hallData.error ?? "Failed to update hall");

      if (newPassword) {
        const passwordResponse = await fetch(`${API_BASE_URL}/api/user/update-password`, {
          method: "POST", headers, body: JSON.stringify({ password: newPassword }),
        });
        const passwordData = await passwordResponse.json().catch(() => ({}));
        if (!passwordResponse.ok) throw new Error(passwordData.error ?? "Failed to update password");
      }

      updateUser({ name: newName.trim(), preferred_hall_id: newHallId });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setBusy(false);
    }
  };

  const hallName = HALLS.find((hall) => hall.id === user.preferred_hall_id)?.name ?? "Not set";

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-4 pb-16 pt-(--header-height,72px) font-spaceG text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between border-b border-slate-200 py-6">
          <div className="flex items-center gap-3"><ArrowLeft className="h-5 w-5" /><span className="text-base font-semibold text-slate-500">Dashboard / Profile</span></div>
          <button type="button" onClick={editing ? cancelEdit : startEdit} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-[#1967d2] shadow-sm transition hover:shadow-md">
            {editing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}{editing ? "Cancel" : "Edit profile"}
          </button>
        </div>

        <section className="mt-8 rounded-[28px] bg-white px-5 py-8 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] sm:px-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#d8f0dc] text-[#31954a]"><UserRound className="h-12 w-12" /></div>
            <h1 className="mt-5 text-3xl font-bold">{user.name}</h1>
            <p className="mt-2 text-lg text-slate-500">{user.email}</p>
          </div>

          {editing ? (
            <div className="mt-10 space-y-5">
              <label className="block"><span className="mb-2 block text-base font-semibold text-slate-600">Full name</span><input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg outline-none focus:border-[#31954a]" /></label>
              <label className="block"><span className="mb-2 block text-base font-semibold text-slate-600">Preferred destination</span><select value={newHallId} onChange={(e) => setNewHallId(e.target.value as HallId)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg outline-none focus:border-[#31954a]">{HALLS.map((hall) => <option key={hall.id} value={hall.id}>{hall.name}</option>)}</select></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-base font-semibold text-slate-600">New password</span><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep it" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg outline-none focus:border-[#31954a]" /></label><label className="block"><span className="mb-2 block text-base font-semibold text-slate-600">Confirm password</span><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg outline-none focus:border-[#31954a]" /></label></div>
              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-600">{error}</p>}
              <button type="button" onClick={handleSave} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#218b49] px-5 py-4 text-lg font-bold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#176d38] disabled:opacity-60"><Save className="h-5 w-5" />{busy ? "Saving changes..." : "Save all changes"}</button>
            </div>
          ) : (
            <div className="mt-10 divide-y divide-slate-200 rounded-2xl bg-[#fbfcfe] px-5 sm:px-8">
              <div className="flex items-center gap-5 py-5"><div className="rounded-2xl bg-[#eaf5ed] p-4 text-[#31954a]"><UserRound className="h-7 w-7" /></div><div><p className="text-lg text-slate-500">Student ID</p><p className="text-2xl font-bold">{user.roll}</p></div></div>
              <div className="flex items-center gap-5 py-5"><div className="rounded-2xl bg-[#eaf5ed] p-4 text-[#31954a]"><LockKeyhole className="h-7 w-7" /></div><div><p className="text-lg text-slate-500">Gender</p><p className="text-2xl font-bold capitalize">{user.gender}</p></div></div>
              <div className="flex items-start gap-5 py-5"><div className="rounded-2xl bg-[#eaf5ed] p-4 text-[#31954a]"><MapPin className="h-7 w-7" /></div><div><p className="text-lg text-slate-500">Preferred destination</p><p className="text-2xl font-bold">{hallName}</p></div></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Profile;
