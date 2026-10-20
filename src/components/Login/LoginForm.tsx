import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate, useLocation } from "react-router";
import { validateLogin } from "../../utils/utils";
import { login } from "../../services/auth.service";

type LoginData = {
  email: string;
  password: string;
};

type FormErrors = Record<string, string>;

interface LoginFormProps {
  view: string;
  toggleView: () => void;
  saveToken: (token: string) => void;
  getAuthErrorMessage: (message: string) => string;
}

export const LoginForm = ({ view, toggleView, saveToken, getAuthErrorMessage }: LoginFormProps) => {
  const [data, setData] = useState<LoginData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateLogin(data);
    setErrors(validationErrors);
    setSubmitted(false);

    if (Object.keys(validationErrors).length === 0) {
      const {data: authData, error} = await login(data.email, data.password);

      if (error) {
        setErrors({form: getAuthErrorMessage(error.message)});
        return;
      }

      if (authData.session?.access_token) {
        saveToken(authData.session.access_token);
      }

      setSubmitted(true);
      setData({email: "", password: ""});
      const userName = authData.user?.user_metadata?.name || authData.user?.email || "Usuario";
      localStorage.setItem("user-name", userName);
      
      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";
      navigate(fromPath, { replace: true });
    }
  };

  return (
    <div className={`form login ${view === "login" ? "active" : ""}`}>
      <form onSubmit={handleSubmit} noValidate>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}

        <input
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        {errors.password && (
          <span className="field-error">{errors.password}</span>
        )}
        {errors.form && <span className="field-error">{errors.form}</span>}

        <p>Forgot password?</p>
        <button type="submit">LOGIN</button>

        {submitted && (
          <p className="success-message">Login saved successfully!</p>
        )}

        <a onClick={toggleView}>
          Don't have an account? <em>Register here</em>
        </a>
      </form>
    </div>
  );
};