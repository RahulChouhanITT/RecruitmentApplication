import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { SocketProvider } from "../socket/SocketProvider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );
};
