"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader, Eye, EyeOff, Building2 } from "lucide-react";
import apiClient from "@/lib/axios";

const agencyLoginSchema = z.object({
  email: z.string().email("Email i pavlefshëm"),
  password: z.string().min(1, "Fjalëkalimi është i detyrueshëm"),
});

type AgencyLoginForm = z.infer<typeof agencyLoginSchema>;

const AgencyLoginPage = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<AgencyLoginForm>({
    resolver: zodResolver(agencyLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: AgencyLoginForm) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const res = await apiClient.post("/agency/login", {
        email: values.email,
        password: values.password,
      });

      const token = res?.data?.data;
      if (!token) throw new Error("No token received");

      localStorage.setItem("agencyAuthToken", token);
      window.dispatchEvent(new Event("agencyUserChange"));
      router.push("/agency/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Email ose fjalëkalim i gabuar.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Agency Portal</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Hyr në llogarinë tuaj
              </h1>
              <p className="text-sm text-gray-500">
                Portali i agjencive partnere
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
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          type="email"
                          placeholder="agjencia@email.com"
                          className="border-gray-300 h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Fjalëkalimi
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            disabled={isLoading}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-gray-300 h-10 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-gray-900 text-white hover:bg-gray-800"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" /> Duke hyrë...
                    </span>
                  ) : (
                    "Hyr"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-gray-400">
          © 2025 IdoTours. Të gjitha të drejtat e rezervuara.
        </p>
      </div>
    </div>
  );
};

export default AgencyLoginPage;
