import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import logoComplete from "../assets/images/logo-avatar-wordmark-2x.png";
import backgroundImage from "../assets/images/bg-1.jpg";

interface LoginPageProps {
  isSignUp: boolean;
  email: string;
  password: string;
  error: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  isSignUp,
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}) => {
  return (
    <div
      className="bg-cover bg-center w-full h-full from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
      }}
    >
      {/* Logo/Branding */}
      <div className="mb-2 text-center">
        <div className="flex items-center justify-center gap-3">
          <img
            src={logoComplete}
            alt="Friendo Pretendo Logo"
            className="w-64 h-auto"
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="w-3/4 max-w-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 h-12 rounded-lg"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 h-12 rounded-lg"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold h-12 rounded-lg"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>

          {/* Toggle Mode Links */}
          <div className="space-y-2 text-center text-sm">
            {!isSignUp && (
              <>
                <button
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 block w-full"
                  onClick={() => {
                    /* TODO: Implement forgot password */
                  }}
                >
                  Forgot password?
                </button>
                <div className="text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onToggleMode}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Sign up here!
                  </button>
                </div>
              </>
            )}
            {isSignUp && (
              <div className="text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
