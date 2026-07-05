import { useState, useEffect } from "react";
import { Badge, Button, Card, Field, PageHeader } from "../components/UI";
import { useAppData } from "../context/AppData";

export default function Profile() {
  const { currentUser, update } = useAppData();
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
        role: currentUser.role || "",
      });
    }
  }, [currentUser]);

  const change = (key, value) => {
    setProfile({ ...profile, [key]: value });
    setSaved(false);
  };

  const save = async () => {
    if (!profile.name.trim() || !profile.email.includes("@")) {
      return setError("Enter a valid name and email address.");
    }
    try {
      await update("users", {
        ...currentUser,
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      setError("");
      setSaved(true);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  if (!currentUser) return null;

  const initials = profile.name
    ? profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      <PageHeader title="Profile" description="View and update your account information." />
      <Card className="max-w-3xl p-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
            {initials}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{profile.name}</h2>
            <p className="text-sm text-slate-500">{profile.role}</p>
          </div>
          {saved && (
            <span className="ml-auto">
              <Badge tone="green">Changes saved</Badge>
            </span>
          )}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input className="form-control" value={profile.name} onChange={(e) => change("name", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="form-control" type="email" value={profile.email} onChange={(e) => change("email", e.target.value)} />
          </Field>
          <Field label="Role">
            <input className="form-control bg-slate-50" value={profile.role} readOnly />
          </Field>
          <div className="sm:col-span-2">
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <Button type="button" onClick={save}>Save changes</Button>
          </div>
        </div>
      </Card>
    </>
  );
}
