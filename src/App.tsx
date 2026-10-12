import { AppRoutes } from "./routing/Routes";
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {

  return (
    <AuthProvider>
      <NotificationProvider>
        <SearchProvider>
          <AppRoutes />
        </SearchProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;