import React from "react";
import { Link } from "react-router-dom";
import { Icons } from "@/components/ui/icons";
import { UserAuthForm } from "@/components/ui/user-auth-form"; // Ensure this import path is correct

const SignUpPage: React.FC = () => {
  return (
    <div className="container h-screen w-screen flex-col center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Blueberry
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        <UserAuthForm formType="signup" />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?
          <Link
            to="/login"
            className="hover:text-brand hover:bg-slate-200 mx-1 py-1 px-2 underline underline-offset-4 rounded-md"
          >
            Sign In
          </Link>
        </p>
      </div>
      {/* <Link
        to="/privacy-policy"
        target='_blank'
        className="hover:text-brand text-muted-foreground hover:bg-slate-200 mx-1 py-1 absolute bottom-2 left-1 px-2 text-sm rounded-md"
      >
        Privacy Policy
      </Link> */}
    </div>
  );
};

export default SignUpPage;
