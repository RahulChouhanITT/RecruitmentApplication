import { AppRoutes } from './routes/AppRoutes';
import { Toast } from './shared/components/Toast';
import { GlobalLoaderOverlay } from './shared/components/GlobalLoaderOverlay';

const App = () => {
  return (
    <>
      <GlobalLoaderOverlay />
      <AppRoutes />
      <Toast />
    </>
  );
};

export default App;
