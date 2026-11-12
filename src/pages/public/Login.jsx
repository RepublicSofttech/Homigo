import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api, errorMessage } from "../../api/client";
import { homePathFor, useAuth } from "../../context/AuthContext";
import { Field, Tabs } from "../../components/ui";
import { Logo } from "../../components/layout/PublicLayout";

export default function Login() {
  const [params] = useSearchParams();
  const asPartner = params.get("as") === "partner";
  const next = params.get("next");
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("otp");
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(true);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next || homePathFor(user)} replace />;

  const done = (data) => {
    login(data.token, data.user);
    toast.success(`Welcome${data.user.first_name ? ", " + data.user.first_name : ""}!`);
    nav(next || (data.user.user_type === "partner" && data.is_new_user ? "/partner/onboarding" : homePathFor(data.user)), { replace: true });
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/otp/send/", { phone });
      setIsRegistered(data.is_registered);
      setStep(2);
      if (data.debug_otp) toast(`Dev mode OTP: ${data.debug_otp}`, { duration: 8000 });
      else toast.success("OTP sent to your mobile");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const [first_name, ...rest] = name.trim().split(" ");
      const { data } = await api.post("/auth/otp/verify/", {
        phone, otp, user_type: asPartner ? "partner" : "customer", first_name: first_name || "", last_name: rest.join(" "),
      });
      done(data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const pwLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/password-login/", { phone, password });
      done(data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="card">
          <h1 className="text-xl font-bold">{asPartner ? "Partner login / sign up" : "Login or sign up"}</h1>
          <p className="mb-4 text-sm text-slate-500">
            {asPartner ? "Grow your service business with HomeServ." : "Use your mobile number to continue."}
          </p>
          <Tabs tabs={[{ value: "otp", label: "Mobile OTP" }, { value: "password", label: "Staff (password)" }]} value={mode} onChange={(m) => { setMode(m); setStep(1); }} />
          {mode === "password" ? (
            <form onSubmit={pwLogin} className="space-y-4">
              <Field label="Mobile number"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required /></Field>
              <Field label="Password"><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
              <button className="btn-primary w-full" disabled={busy}>Login</button>
            </form>
          ) : step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <Field label="Mobile number">
                <div className="flex">
                  <span className="rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 py-2 text-sm">+91</span>
                  <input className="input rounded-l-none" inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} required />
                </div>
              </Field>
              <button className="btn-primary w-full" disabled={busy || phone.length !== 10}>{busy ? "Sending..." : "Send OTP"}</button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <p className="text-sm">OTP sent to <b>+91 {phone}</b> <button type="button" className="text-brand-600" onClick={() => setStep(1)}>Change</button></p>
              {!isRegistered && (
                <Field label="Your full name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
              )}
              <Field label="Enter OTP">
                <input className="input text-center text-lg tracking-[0.5em]" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus />
              </Field>
              <button className="btn-primary w-full" disabled={busy || otp.length < 4}>{busy ? "Verifying..." : "Verify & continue"}</button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          {asPartner ? <Link to="/login" className="text-brand-600">Login as customer instead</Link> : <Link to="/login?as=partner" className="text-brand-600">Are you a service provider? Join as partner</Link>}
        </p>
      </div>
    </div>
  );
}
