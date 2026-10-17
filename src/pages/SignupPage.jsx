import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Building2, DoorOpen, UserPlus } from "lucide-react";
import { signUp, friendlyAuthError } from "../services/authService";

const inputClass =
  "w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500";

function Field({ id, label, icon: Icon, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input id={id} required className={inputClass} {...props} />
      </div>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    hostelBlock: "",
    roomNumber: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(form.email.trim(), form.password, {
        fullName: form.fullName.trim(),
        hostelBlock: form.hostelBlock.trim(),
        roomNumber: form.roomNumber.trim(),
      });
      navigate("/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900">Join CampusReuse</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Trade, sell and find items within your hostel
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            id="fullName"
            label="Full name"
            icon={User}
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={update("fullName")}
            placeholder="Your name"
          />
          <Field
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@college.edu"
          />
          <Field
            id="password"
            label="Password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update("password")}
            placeholder="At least 6 characters"
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              id="hostelBlock"
              label="Hostel block"
              icon={Building2}
              type="text"
              value={form.hostelBlock}
              onChange={update("hostelBlock")}
              placeholder="e.g. Block A"
            />
            <Field
              id="roomNumber"
              label="Room no."
              icon={DoorOpen}
              type="text"
              value={form.roomNumber}
              onChange={update("roomNumber")}
              placeholder="e.g. 204"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white font-medium py-2.5 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <UserPlus className="h-5 w-5" />
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}