import { IntlProvider } from "react-intl";
import { StoreContextProvider } from "../contexts/StoreContext";
import type { AppProps } from "next/app";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useStore } from "@/hooks/StoreHook";
import '../styles/globals.css'


function Auth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { generalStore } = useStore();
  const [minimumLoadingTimePassed, setMinimumLoadingTimePassed] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingTimePassed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("azure-ad");
    }
  }, [status]);
  useEffect(() => {
    if (session?.user?.azureAdId) {
      generalStore.getUser(session.user.azureAdId); 
    }
  }, [session?.user?.azureAdId]);

  if (status === "loading" || !minimumLoadingTimePassed) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Redirecting to login...</p>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <StoreContextProvider>
        <IntlProvider locale="en" messages={{}}>
          <Auth>
            <Component {...pageProps} />
          </Auth>
        </IntlProvider>
      </StoreContextProvider>
    </SessionProvider>
  );
}
