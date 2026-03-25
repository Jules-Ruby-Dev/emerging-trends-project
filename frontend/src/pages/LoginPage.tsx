import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

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
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Logo/Branding */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <span className="text-2xl">👧</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Friendo</h1>
        <p className="text-cyan-400 text-lg font-semibold">PRETENDO</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm">
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
