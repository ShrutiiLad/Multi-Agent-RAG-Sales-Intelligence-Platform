import * as React from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, signUpUser } from "@/services/auth/auth"; // Ensure this import path is correct
import { AppDispatch } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  formType: "login" | "signup";
}

export function UserAuthForm({
  className,
  formType,
  ...props
}: UserAuthFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      password: "",
      email: "",
    },
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Update onSubmit to use dispatch with loginUser
  const onSubmit = async (data: {
    username: string;
    password: string;
    email?: string;
    firstname: string;
    lastname: string;
  }) => {
    setIsLoading(true);
    try {
      let result;
      // Dispatch loginUser and wait for the promise to resolve
      if (formType === "login") {
        result = await dispatch(loginUser(data.username, data.password));

        if (result.success) {
          setIsLoading(false);
          // Check if the login was successful
          toast({
            title: "Success",
            description: "You're logged in successfully.",
          });
          navigate("/chat"); // Navigate to the HomePage
        } else {
          setIsLoading(false);
          toast({
            title: "Something went wrong.",
            description:
              result?.error?.message ||
              "Your sign in request failed. Please try again.",
            variant: "destructive",
          });
        }
      } else if (formType === "signup") {
        result = await signUpUser(
          data.username,
          data.email ? data.email : "",
          data.password,
          data.firstname,
          data.lastname
        );
        if (result.success) {
          setIsLoading(false);
          // Check if the login was successful
          toast({
            title: "Success",
            description: "You're signed up successfully.",
          });
          navigate("/login"); // Navigate to the login page
        } else {
          setIsLoading(false);
          toast({
            title: "Something went wrong.",
            description:
              result?.error?.message ||
              "Your sign up request failed. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Something went wrong.",
        description: "Your request failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          {formType === "signup" && (
            <>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="firstname">
                  First Name
                </Label>
                <Input
                  id="firstname"
                  placeholder="First Name"
                  type="text"
                  disabled={isLoading}
                  {...register("firstname", {
                    required: "First Name is required",
                  })}
                />
                {errors.firstname && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.firstname.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="lastname">
                  Last Name
                </Label>
                <Input
                  id="lastname"
                  placeholder="Last Name"
                  type="text"
                  disabled={isLoading}
                  {...register("lastname", {
                    required: "Last Name is required",
                  })}
                />
                {errors.lastname && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
            </>
          )}
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Username"
              type="text"
              disabled={isLoading}
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="px-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
          {formType === "signup" && (
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                placeholder="Email"
                type="email"
                disabled={isLoading}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^(.+)@(gemai\.studio|pernod-ricard\.com)$/i,
                    message:
                      "Please enter a valid email address from Gemai Studio or Pernod Ricard",
                  },
                })}
              />
              {errors.email && (
                <p className="px-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              disabled={isLoading}
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={cn(buttonVariants())}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : // <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            formType === "login" ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
