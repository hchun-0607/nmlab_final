import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import './index.css';
import './App.css';

interface Props {
  onBack: () => void;
  onForgot: () => void;
  onSignUp: () => void;
}

export default function LoginPage({ onBack, onForgot, onSignUp }: Props){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Username: ${username}\nPassword: ${password}`);
  };

  // const handleForgot = () => {
  //   // TODO: navigate to forgot-password flow
  //   alert("Go to forgot password");
  // };

  // const handleSignUp = () => {
  //   // TODO: navigate to registration flow
  //   alert("Go to sign up");
  // };

  return (
    <Card className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-xl min-h-[320px] flex flex-col justify-center">
      <CardHeader className="text-center mb-6">
        <CardTitle className="text-4xl font-cursive text-indigo-600">
          Welcome Back
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <Label htmlFor="username" className="block text-sm font-semibold text-gray-700">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
            />
          </div>

          {/* Sign In */}
          <Button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold transition transform duration-200 ease-out hover:scale-105 hover:bg-indigo-700 hover:shadow-lg"
          >
            Sign In
          </Button>
        </form>

        {/* Forgot & Sign Up (horizontal) */}
        <div className="mt-4 flex justify-center space-x-6">
          <Button
            variant="link"
            onClick={onForgot}
            className="text-sm text-indigo-600 no-underline hover:no-underline focus:no-underline"
          >
            Forgot Password?
          </Button>
          <Button
            variant="link"
            onClick={onSignUp}
            className="text-sm text-indigo-600 no-underline hover:no-underline focus:no-underline"
          >
            Sign Up
          </Button>
        </div>

        {/* Back (if you still need it) */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full mt-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition transform duration-200 ease-out hover:scale-105"
        >
          Back
        </Button>
      </CardContent>
    </Card>
  );
}
