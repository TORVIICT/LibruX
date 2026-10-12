import { useState } from "react";
import type { SubmitEvent } from "react";
import { register } from "../../services/auth.service";
import { validateRegister } from "../../utils/utils";

type FormErrors = Record<string, string>;

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

interface RegisterFormProps {
  view: string;
  toggleView: () => void;
  saveToken: (token: string) => void;
  getAuthErrorMessage: (message: string) => string;
}

export const RegisterForm = ({ view, toggleView, saveToken, getAuthErrorMessage }: RegisterFormProps) => {
  const [data, setData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateRegister(data);
    setErrors(validationErrors);
    setSubmitted(false);

    if (Object.keys(validationErrors).length === 0) {
      const {data: authData, error} = await register(
        data.name,
        data.email,
        data.password,
      );

      if (error) {
        setErrors({form: getAuthErrorMessage(error.message)});
        return;
      }

      if (authData.session?.access_token) {
        saveToken(authData.session.access_token);
      }

      setSubmitted(true);
      setData({name: "", email: "", password: ""});
    }
  };

  return (
    <div className={`form register ${view === "register" ? "active" : ""}`}>
      <form onSubmit={handleSubmit} noValidate>
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}

        <input
          type="email"
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

        <button type="submit">REGISTER</button>

        {submitted && (
          <p className="success-message">Registration saved successfully!</p>
        )}

        <a onClick={toggleView}>
          Already have an account? <em>Login here</em>
        </a>
      </form>
    </div>
  );
};