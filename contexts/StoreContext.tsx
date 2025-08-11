import { createContext, PropsWithChildren } from "react";
import { GeneralStore } from "../pages/api/general";

type StoreContextValue = {
  generalStore: GeneralStore;
};

export const StoreContext = createContext<StoreContextValue>(
  {} as StoreContextValue
);

const generalStore = new GeneralStore();

export const StoreContextProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <StoreContext.Provider
      value={{
        generalStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
