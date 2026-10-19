import React from 'react';
import { Link } from 'react-router-dom';
import { UserAuthForm } from '@/components/ui/user-auth-form'; // Ensure this import path is correct
import EchoLogo from '@/assets/avatar/avatar-48/echo.svg';
import EchoAvatar from '@/components/layout/dashboard/components/avatar';

const LoginPage: React.FC = () => {
  return (
    <div className="container center h-screen w-screen flex-col">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex items-center flex-col space-y-2 text-center">
          {/* <img src={logo} alt="logo" className="mx-auto h-6 w-6" /> */}
          <EchoAvatar
            size="medium"
            mainImage={''}
            alt={'Echo Logo'}
            fallbackImage={EchoLogo}
            radius="large"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back!
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        <UserAuthForm formType="login" />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?
          <Link
            to="/signup"
            className="hover:text-brand hover:bg-slate-200 mx-1 py-1 px-2 underline underline-offset-4 rounded-md"
          >
            Sign Up
          </Link>
        </p>
      </div>
      <Link
        to="/privacy-policy"
        target='_blank'
        className="hover:text-brand text-muted-foreground hover:bg-slate-200 mx-1 py-1 absolute bottom-2 left-1 px-2 text-sm rounded-md"
      >
        Privacy Policy
      </Link>
    </div>
  );
};

export default LoginPage;