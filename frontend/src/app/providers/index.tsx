import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { store } from '../store';
import { SocketProvider } from '../socket/SocketProvider';
import { theme } from '../../shared/styles/theme';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SocketProvider>{children}</SocketProvider>
      </ThemeProvider>
    </Provider>
  );
};
