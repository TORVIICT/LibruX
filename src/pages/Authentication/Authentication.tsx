import { useState } from "react";
import logo from "../../assets/Logo.png";
import "./Authentication.scss";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { LoginForm } from "../../components/Login/LoginForm";
import { RegisterForm } from "../../components/Register/RegisterForm";

type View = "login" | "register";

type ViewProps = {
  view: View;
  toggleView: () => void;
};

function saveToken(token: string) {
  localStorage.setItem("auth-token", token);
}

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("email not confirmed")) {
    return "the email is not confirmed.";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "the email or password are incorrect.";
  }

  return message;
}

export const Authentication = () => {
  const [view, setView] = useState<View>("login");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/dashboard");
  }

  const toggleView = () => setView(view === "login" ? "register" : "login");

  return (
    <section className="page signup-page">
      <div className="signup-card">
        <CardBackground view={view} />
        <LogoGroup logo={logo} />
        <LoginForm view={view} toggleView={toggleView} saveToken={saveToken} getAuthErrorMessage={getAuthErrorMessage}/>
        <RegisterForm view={view} toggleView={toggleView} saveToken={saveToken} getAuthErrorMessage={getAuthErrorMessage}/>
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

export default Authentication;