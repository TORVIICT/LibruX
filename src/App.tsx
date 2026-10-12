import { AppRoutes } from "./routing/Routes";
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";

function App() {

  return (
    <AuthProvider>
      <SearchProvider>
        <AppRoutes />
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;