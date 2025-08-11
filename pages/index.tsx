import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      update();
    }
  }, [status, update]);

  useEffect(() => {
    if (status === "loading") return;
    if (session) router.replace("/firewalls/request-access");
  }, [session, status, router]);

  return null;
}
