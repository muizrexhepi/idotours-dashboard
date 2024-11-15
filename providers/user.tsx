"use client";

import { account } from "@/appwrite.config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppwriteException } from "appwrite";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const getUser = async () => {
    try {
      const session = await account.getSession('current');
      
      if (!session) {
        return router.push('/login');
      }

      const user = await account.get();
      console.log({ user });

    } catch (error) {
      if (error instanceof AppwriteException) {
        console.error("Appwrite error: ", error.message);

        if (error.code === 401 || error.message.includes('missing scope')) {
          return router.push('/login');
        }
      } else {
        console.error("Unexpected error: ", error);
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return <div>{children}</div>;
}
