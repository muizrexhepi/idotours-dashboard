"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader, Eye, EyeOff } from "lucide-react";
import { FormError } from "@/components/form-error";
import Image from "next/image";
import Link from "next/link";

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/operator/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Email ose fjalëkalim i gabuar.");
        setIsLoading(false);
        return;
      }

      const token = data.data;
      if (!token) {
        setError("Ndodhi një gabim. Provo përsëri.");
        setIsLoading(false);
        return;
      }

      // Dekodimi i JWT për t'u siguruar që përdoruesi është operator
      const decoded = decodeJWT(token);
      const role = decoded?.data?.role;

      if (role === "operator") {
        localStorage.setItem("authToken", token);
        window.dispatchEvent(new Event("userChange"));
        router.push("/");
      } else {
        setError("Kjo llogari nuk ka qasje si operator.");
      }
    } catch (err: any) {
      setError(err.message || "Ndodhi një gabim gjatë hyrjes.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 z-50">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/30" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <Link href="https://gobusly.com" className="inline-block">
          <Image
            src="/logo.png"
            alt="Gobusly Logo"
            width={160}
            height={60}
            className="h-12 w-auto hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Main */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Hyrja për Operatorët
              </h1>
              <p className="text-sm text-gray-600">
                Mirësevini përsëri! Ju lutem jepni të dhënat tuaja.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          type="email"
                          placeholder="Shkruani email-in tuaj"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-600 mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-gray-900 mb-2">
                        Fjalëkalimi
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            disabled={isLoading}
                            type={showPassword ? "text" : "password"}
                            placeholder="Shkruani fjalëkalimin tuaj"
                            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-600 mt-1" />
                    </FormItem>
                  )}
                />

                <FormError message={error} />

                <Button
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-tr from-[#ff6700] to-[#ff007f] hover:from-[#e55a00] hover:to-[#e6006b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Duke hyrë...
                    </div>
                  ) : (
                    "Hyni"
                  )}
                </Button>
              </form>
            </Form>

            {/* Seksioni për Agjencitë */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Jeni agjenci?{" "}
                <Link
                  href="/agency/login"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Hyni këtu
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <Link
                href="https://gobusly.com/help/contact-support"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Kontaktoni mbështetjen
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-center z-10">
        <p className="text-xs text-gray-500">
          © 2025 IdoTours. Të gjitha të drejtat e rezervuara.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
