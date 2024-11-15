"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "../../components/ui/button";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Loader } from "lucide-react";
import { FormError } from "@/components/form-error";
import { account } from "@/appwrite.config";
import { USER_LABELS } from "@/lib/data";

const LoginForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

      // await account.deleteSessions();

      await account.createEmailPasswordSession(
        user.email,
        user.password
      );

      const newUser = await account.get();
      if(newUser.labels[0] !== USER_LABELS.OPERATOR) {
        setIsLoading(false)
        await account.deleteSessions();
        return setError("Not authorized");
      }
      console.log({papafingo: newUser})
      if (newUser) {
        window.dispatchEvent(new Event("userChange"));
        setError("");
        setIsLoading(false);
        router.push('/')
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong!");
      console.log(error.response);
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={true}>
      <DialogContent className="h-screen sm:h-fit flex flex-col justify-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">Login to your account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} type="email" />
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
                    <FormLabel className="flex justify-between items-center">
                      <p>Password</p>
                      <Button
                        type="button"
                        variant={"link"}
                        className="text-sm font-medium text-indigo-500"
                      >
                        Forgot password?
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error} />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader className="h-3 w-3 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
    
      </DialogContent>
    </Dialog>
  );
};

export default LoginForm;
