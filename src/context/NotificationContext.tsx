import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loansService } from "../services/loans.service";
import { useAuth } from "./AuthContext";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    item: Omit<NotificationItem, "id" | "timestamp" | "read"> & {
      id?: string;
      timestamp?: string;
      read?: boolean;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  checkLoanDeadlines: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = "librux_notifications";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "welcome-notif",
    title: "Bienvenido a Librux",
    message: "Explora nuestro catálogo digital y gestiona tus préstamos.",
    type: "info",
    timestamp: new Date().toISOString(),
    read: false,
    link: "/books",
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Could not save notifications to localStorage:", e);
    }
  }, [notifications]);

  const addNotification = useCallback(
    (
      item: Omit<NotificationItem, "id" | "timestamp" | "read"> & {
        id?: string;
        timestamp?: string;
        read?: boolean;
      }
    ) => {
      const newNotif: NotificationItem = {
        id: item.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: item.title,
        message: item.message,
        type: item.type,
        timestamp: item.timestamp || new Date().toISOString(),
        read: item.read ?? false,
        link: item.link,
      };

      setNotifications((prev) => {
        // Evitar duplicados por id si se pasó uno específico
        if (item.id && prev.some((n) => n.id === item.id)) {
          return prev;
        }
        return [newNotif, ...prev];
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Verificar automáticamente vencimientos de préstamos activos
  const checkLoanDeadlines = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await loansService.getUserLoans();
      const loans = res.data || [];
      const now = new Date().getTime();

      loans.forEach((loan) => {
        if (loan.status === "ACTIVE" || loan.status === "RENEWED") {
          const dueDate = new Date(loan.dueDate).getTime();
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          const bookTitle = loan.bookReference?.title || "Libro prestado";

          if (diffDays < 0) {
            // Préstamo vencido
            addNotification({
              id: `loan-overdue-${loan.id}`,
              title: "Préstamo Vencido",
              message: `El préstamo de "${bookTitle}" venció hace ${Math.abs(diffDays)} días.`,
              type: "alert",
              link: "/loans",
            });
          } else if (diffDays <= 3) {
            // Vence pronto (menos de 3 días)
            addNotification({
              id: `loan-due-soon-${loan.id}`,
              title: "Próximo a Vencer",
              message: `"${bookTitle}" vence en ${diffDays === 0 ? "hoy" : `${diffDays} día(s)`}.`,
              type: "warning",
              link: "/loans",
            });
          }
        }
      });
    } catch {
      // Ignorar silenciosamente si falla la llamada
    }
  }, [isAuthenticated, addNotification]);

  useEffect(() => {
    if (isAuthenticated) {
      checkLoanDeadlines();
    }
  }, [isAuthenticated, checkLoanDeadlines]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        checkLoanDeadlines,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  removeNotification: () => {},
  clearAll: () => {},
  checkLoanDeadlines: async () => {},
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  return context || defaultNotificationContext;
}

