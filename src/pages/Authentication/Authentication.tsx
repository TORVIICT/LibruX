import { useState } from "react";
import type { SubmitEvent } from "react";
import logo from "../../assets/Logo.png";
import "./Authentication.scss";
import { login, register } from "../../services/auth.service";
import { useNavigate } from "react-router";

type View = "login" | "register";

type ViewProps = {
  view: View;
  toggleView: () => void;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type FormErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(data: LoginData): FormErrors {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Enter a valid email.";
  }

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  return errors;
}

function validateRegister(data: RegisterData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Enter a valid email.";
  }

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  return errors;
}

function saveToken(token: string) {
  localStorage.setItem("auth-token", token);
}

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("email not confirmed")) {
    return "Confirma tu correo electrónico antes de iniciar sesión.";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "El correo o la contraseña son incorrectos.";
  }

  return message;
}

export const Authentication = () => {
  const [view, setView] = useState<View>("login");

  const toggleView = () => setView(view === "login" ? "register" : "login");

  return (
    <section className="page signup-page">
      <div className="signup-card">
        <CardBackground view={view} />
        <LogoGroup logo={logo} />
        <LoginForm view={view} toggleView={toggleView} />
        <RegisterForm view={view} toggleView={toggleView} />
      </div>
    </section>
  );
};

const CardBackground = ({ view }: Pick<ViewProps, "view">) => {
  const bgClass = view === "login" ? "register" : "login";

  return (
    <>
      <div className={`card-bg card-bg-1 ${bgClass}`}></div>
      <div className={`card-bg card-bg-2 ${bgClass}`}></div>
    </>
  );
};

const LogoGroup = ({ logo }: { logo: string }) => {
  return (
    <>
      <img className="logo logo-1" src={logo} alt="logo" />
      <img className="logo logo-2" src={logo} alt="logo" />
    </>
  );
};


const LoginForm = ({ view, toggleView }: ViewProps) => {
  const [data, setData] = useState<LoginData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

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
      navigate("/home");
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

const RegisterForm = ({ view, toggleView }: ViewProps) => {
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

export default Authentication;