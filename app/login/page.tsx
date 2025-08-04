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
import { account } from "@/appwrite.config";
import { USER_LABELS } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const LoginPage = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    console.log(values);
    try {
      const user = {
        email: values.email,
        password: values.password,
      };
      await account.createEmailPasswordSession(user.email, user.password);
      const newUser = await account.get();
      if (newUser.labels[0] !== USER_LABELS.OPERATOR) {
        setIsLoading(false);
        await account.deleteSessions();
        return setError("Not authorized");
      }
      console.log({ papafingo: newUser });
      if (newUser) {
        window.dispatchEvent(new Event("userChange"));
        setError("");
        setIsLoading(false);
        router.push("/");
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong!");
      console.log(error.response);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/30"></div>

      {/* Header with Logo */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <Link href="https://gobusly.com" className="inline-block">
          <Image
            src="/assets/icons/dark-logo.svg"
            alt="Gobusly Logo"
            width={120}
            height={40}
            className="h-8 w-auto hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Sign in to your account
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back! Please enter your details.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
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
                            placeholder="Enter your email"
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
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              disabled={isLoading}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
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
                        Signing in...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </Form>

              {/* Support Link */}
              <div className="text-center">
                <Link
                  href="https://gobusly.com/help/contact-support"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center z-10">
        <p className="text-xs text-gray-500">
          © 2025 Gobusly. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
