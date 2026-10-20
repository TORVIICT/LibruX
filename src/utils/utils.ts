import type { NotificationItem } from "../context/NotificationContext";

type FormErrors = Record<string, string>;

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(data: LoginData): FormErrors {
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

export function validateRegister(data: RegisterData): FormErrors {
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

export const getIcon = (type: NotificationItem["type"]) => {
  switch (type) {
    case "alert":
      return { icon: "error", className: "icon-alert" };
    case "warning":
      return { icon: "warning", className: "icon-warning" };
    case "success":
      return { icon: "check_circle", className: "icon-success" };
    case "info":
    default:
      return { icon: "info", className: "icon-info" };
  }
};

export const formatTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return ` ${diffHours} h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  } catch {
    return "";
  }
};