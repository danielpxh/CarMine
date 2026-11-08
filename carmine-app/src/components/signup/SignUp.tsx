"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

export default function SignUpPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [unreadMessages] = useState(2);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Signup failed: ${error.message}`);
        return;
      }

      alert("Signup successful! Redirecting to login...");
      router.push("/signin");
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        unreadMessages={unreadMessages}
        onLogout={() => console.log("Logout clicked")}
      />
      <section className="min-h-[calc(100vh-6rem)] bg-stone-50 px-4 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100 md:py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Sign Up
          </h1>
          <Card
            className={`rounded-xl border shadow-sm ${
              darkMode
                ? "border-gray-700 bg-gray-900"
                : "border-stone-200 bg-white"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your details to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-stone-300 bg-white text-stone-900 focus:border-rose-800 focus:ring-rose-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-stone-300 bg-white text-stone-900 focus:border-rose-800 focus:ring-rose-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col space-y-2 relative">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-stone-300 bg-white text-stone-900 focus:border-rose-800 focus:ring-rose-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      {password.length > 0 && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                          {passwordVisible ? (
                            <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 relative">
                    <Label
                      htmlFor="confirm-password"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={passwordVisible2 ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="border-stone-300 bg-white text-stone-900 focus:border-rose-800 focus:ring-rose-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    {password.length > 0 && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                        onClick={() => setPasswordVisible2(!passwordVisible2)}
                      >
                        {passwordVisible2 ? (
                          <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <Button className="mt-4 h-11 w-full bg-rose-800 text-white hover:bg-rose-900 focus:ring-rose-800">
                  Sign Up
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center rounded-b-xl border-t border-stone-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-rose-800 hover:underline dark:text-rose-300"
                >
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>
      <Footer darkMode={darkMode} />
    </div>
  );
}
