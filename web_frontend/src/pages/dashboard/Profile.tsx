import { useState } from "react";
import { Edit3, MapPin, Save, UserRound, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { HALLS, type HallId } from "../../constant/halls";
import FeedbackPopup from "../../components/feedback/FeedbackPopup";
import FieldWarning from "../../components/feedback/FieldWarning";
import { GenderIcon, IdcardIcon } from "../../assets/icons/Icons";
import StyledSelect from "../../components/common/StyledSelect";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";
const activeHalls = HALLS.filter((hall) => hall.active);

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newHallId, setNewHallId] = useState<HallId | "">(activeHalls[0]?.id ?? "");
  const [error, setError] = useState("");
  const [validationField, setValidationField] = useState<"name" | "hall" | "password" | null>(null);
  const [popup, setPopup] = useState<{
    tone: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const startEdit = () => {
    setError("");
    setNewName(user.name);
    const preferredHall = activeHalls.find((hall) => hall.id === user.preferred_hall_id);
    setNewHallId(preferredHall?.id ?? activeHalls[0]?.id ?? "");
    setNewPassword("");
    setConfirmPassword("");
    setValidationField(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
    setValidationField(null);
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty.");
      setValidationField("name");
      return;
    }
    if (!newHallId) {
      setError("Please select a preferred hall.");
      setValidationField("hall");
      return;
    }
    if (newPassword && !/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(newPassword)) {
      setError("Password must be at least 6 characters with one letter and one digit.");
      setValidationField("password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setValidationField("password");
      return;
    }

    setBusy(true);
    setError("");
    setValidationField(null);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const nameResponse = await fetch(`${API_BASE_URL}/api/user/update-name`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: newName.trim() }),
      });
      const nameData = await nameResponse.json().catch(() => ({}));
      if (!nameResponse.ok)
        throw new Error(nameData.error ?? "Failed to update name");

      const hallResponse = await fetch(`${API_BASE_URL}/api/user/update-hall`, {
        method: "POST",
        headers,
        body: JSON.stringify({ preferred_hall_id: newHallId }),
      });
      const hallData = await hallResponse.json().catch(() => ({}));
      if (!hallResponse.ok)
        throw new Error(hallData.error ?? "Failed to update hall");

      if (newPassword) {
        const passwordResponse = await fetch(
          `${API_BASE_URL}/api/user/update-password`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ password: newPassword }),
          },
        );
        const passwordData = await passwordResponse.json().catch(() => ({}));
        if (!passwordResponse.ok)
          throw new Error(passwordData.error ?? "Failed to update password");
      }

      updateUser({ name: newName.trim(), preferred_hall_id: newHallId });
      setEditing(false);
      setPopup({
        tone: "success",
        title: "Profile updated",
        message: "Your profile changes were saved successfully.",
      });
    } catch (err) {
      setPopup({
        tone: "error",
        title: "Profile update failed",
        message:
          err instanceof Error
            ? err.message
            : "Unable to update profile. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const hallName =
    HALLS.find((hall) => hall.id === user.preferred_hall_id)?.name ?? "Not set";

  const userData = [
    {
      label: "Student ID",
      data: user.roll,
      icon: <IdcardIcon className="h-5 w-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
    },
    {
      label: "Gender",
      data: user.gender,
      icon: <GenderIcon className="h-5 w-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
    },
    {
      label: "Preferred destination",
      data: hallName,
      icon: <MapPin className="h-5 w-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />,
    },
  ];

  return (
    <main className=" min-h-screen bg--[#f5f8fc] px-6 sm:px-8 pb-16 pt-(--header-height,72px) font-spaceG text-slate-900">
      <FeedbackPopup
        open={Boolean(popup)}
        tone={popup?.tone ?? "error"}
        title={popup?.title ?? ""}
        message={popup?.message ?? ""}
        onClose={() => setPopup(null)}
      />
      <div className="z-10 mx-auto max-w-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-2 py-6">
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-semibold text-slate-500">
              Dashboard /{" "}
              <span className="text-[#1967d2] underline underline-offset-2">
                Profile
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={editing ? cancelEdit : startEdit}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm sm:text-base font-semibold text-[#1967d2] shadow-sm transition hover:shadow-md"
          >
            {editing ? (
              <X className="w-4 h-4 sm:h-5 sm:w-5" />
            ) : (
              <Edit3 className="w-4 h-4 sm:h-5 sm:w-5" />
            )}
            {editing ? "Cancel" : "Edit profile"}
          </button>
        </div>

        <section className="relative mt-8 rounded-xl bg-linear-to-tr from-pink-600 to-violet-600 text-white px-5 py-8 shadow-[0px_0px_10px_rgba(0,0,0,0.5)] sm:px-12">
          <div
            className="absolute inset-0 z-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #ffffff50 2.5px, transparent 1.5px)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="z-50 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_0px_15px_rgba(0,0,0,0.5)] sm:h-24 sm:w-24">
              <UserRound className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="mt-5 text-xl sm:text-2xl lg:text-3xl font-bold text-shadow-lg">
              {user.name}
            </h1>
            <p className="mt-2 sm:text-md  lg:text-lg text-slate-100 text-shadow-lg">
              {user.email}
            </p>
          </div>

          {editing ? (
            <div className="z-50 mt-10 space-y-5 px-1 sm:py-2">
              <label className="block">
                <span className="mb-2 block text-base font-semibold text-slate-50">
                  Full name
                </span>
                <div className="relative">
                  <FieldWarning message={validationField === "name" ? error : undefined} />
                  <input
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (validationField === "name") {
                        setValidationField(null);
                        setError("");
                      }
                    }}
                    className={`w-full rounded-lg text-gray-800 border border-slate-200 bg-slate-50 px-5 py-2 text-md sm:text-lg outline-none focus:border-[#31954a] ${validationField === "name" ? "border-amber-500 ring-2 ring-amber-100" : ""}`}
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-base font-semibold text-slate-50">
                  Preferred destination
                </span>
                <div className="relative">
                  <FieldWarning message={validationField === "hall" ? error : undefined} />
                  <StyledSelect
                    id="update-hall-select"
                    value={newHallId}
                    options={activeHalls.map((hall) => ({
                      value: hall.id,
                      label: hall.name,
                    }))}
                    placeholder=""
                    onChange={(value) => {
                      setNewHallId(value as HallId);
                      if (validationField === "hall") {
                        setValidationField(null);
                        setError("");
                      }
                    }}
                    error={validationField === "hall"}
                  />
                </div>
              </label>
              <div className="grid gap-5 sm:grid-cols-2 mb-7">
                <label className="block">
                  <span className="mb-2 block text-base font-semibold text-slate-50">
                    New password
                  </span>
                  <div className="relative">
                    <FieldWarning message={validationField === "password" ? error : undefined} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (validationField === "password") {
                          setValidationField(null);
                          setError("");
                        }
                      }}
                      placeholder="Leave blank to keep it"
                      className={`w-full rounded-lg text-gray-800 border border-slate-200 bg-slate-50 px-5 py-2 text-md sm:text-lg outline-none focus:border-[#31954a] ${validationField === "password" ? "border-amber-500 ring-2 ring-amber-100" : ""}`}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-base font-semibold text-slate-50">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationField === "password") {
                        setValidationField(null);
                        setError("");
                      }
                    }}
                    placeholder="Repeat new password"
                    className={`w-full rounded-lg text-gray-800 border border-slate-200 bg-slate-50 px-5 py-2 text-md sm:text-lg outline-none focus:border-[#31954a] ${validationField === "password" ? "border-amber-500 ring-2 ring-amber-100" : ""}`}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className=" relative z-50 flex w-full items-center justify-center gap-3 rounded-full bg-green-600 px-5 py-3 text-lg font-bold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#176d38] disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                {busy ? "Saving changes..." : "Save all changes"}
              </button>
            </div>
          ) : (
            <div className="z-50 mt-10 mb-2 divide-y divide-slate-200 rounded-2xl bg-[#fbfcfe] px-5 sm:px-8 shadow-[0_0px_15px_rgba(0,0,0,0.5)]">
              {userData.map((value, key) => (
                <div className="flex items-center gap-5 py-5" key={key}>
                  <div className="rounded-md p-1.5 sm:p-2 text-blue-600 shadow-[0_0px_5px_rgba(0,0,0,0.3)]">
                    {value.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs sm:text-sm text-slate-500 font-robot tracking-wider">
                      {value.label}
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 font-roboto tracking-wider text-shadow-2xs">
                      {value.data}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Profile;
