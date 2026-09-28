import { AppRoutes } from "./routing/Routes";
import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;