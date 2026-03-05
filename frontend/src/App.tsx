import { AppRoutes } from "./routes/AppRoutes";
import { Toast } from "./shared/components/Toast/Toast";

const App = () => {
  return (
    <>
      <AppRoutes />
      <Toast />
    </>
  );
};

export default App;
