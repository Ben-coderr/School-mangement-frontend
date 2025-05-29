import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import InputField from './InputField';
import Button from '../ui/Button';
import SocialLogin from './SocialLogin';
import { useAuth } from '../../context/authContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Pass rememberMe as second argument
      const success = await login({ username, password }, rememberMe);

      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="space-y-6">
        {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400 animate-fadeIn">
              {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
              id="username"
              type="username"
              label="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              placeholder="Enter your username"
              required
          />

          <InputField
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              placeholder="Enter your password"
              required
              endAdornment={
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none text-gray-400 hover:text-gray-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                  ) : (
                      <Eye className="h-5 w-5" />
                  )}
                </button>
              }
          />

          <div className="flex items-center justify-between mt-6">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                />
                <div className={`block w-5 h-5 rounded-md border-2 transition-colors ${
                    rememberMe
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300  group-hover:border-blue-400'
                }`} />
                {rememberMe && (
                    <svg
                        className="absolute top-0.5 left-0.5 w-4 h-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                      <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                      />
                    </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>
            </label>

            <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <Button
              type="submit"
              isLoading={isLoading}
          >
            Sign in
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 "></div>
          </div>
          <div className="relative flex justify-center text-sm">
          {/*<span className="px-2 bg-white  text-gray-500 dark:text-gray-400">*/}
          {/*  Or continue with*/}
          {/*</span>*/}
          </div>
        </div>

        {/*<SocialLogin />*/}
      </div>
  );
};

export default LoginForm;