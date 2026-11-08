"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Car,
  ShoppingBag,
  Key,
  Zap,
  Star,
  Quote,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTheme } from "@/components/ThemeContext";
import Link from "next/link";
import "./globals.css";

export default function CarMine() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [unreadMessages] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const testimonials = [
    {
      name: "John D.",
      comment:
        "CarMine made buying my dream car a breeze. Highly recommended!",
    },
    {
      name: "Sarah M.",
      comment:
        "The parts marketplace saved me time and money. Great selection and prices.",
    },
    {
      name: "Mike R.",
      comment:
        "Renting through CarMine was smooth and hassle-free. Will use again!",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-stone-50 text-gray-900"
      }`}
    >
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        unreadMessages={unreadMessages}
        onLogout={() => console.log("Logout clicked")}
      />

      <main className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <h1 className="mx-auto mb-4 max-w-4xl text-center text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          The right car changes everything.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-center text-base text-stone-600 dark:text-gray-400 sm:text-lg">
          Find your next vehicle, list one for sale, or explore a rental—all in
          one place.
        </p>

        <div className="mx-auto mb-16 max-w-3xl">
          <form
            onSubmit={handleSearch}
            className={`flex flex-col gap-2 rounded-xl border p-2 shadow-sm sm:flex-row ${
              darkMode
                ? "border-gray-700 bg-gray-900"
                : "border-stone-200 bg-white"
            }`}
          >
            <Input
              type="text"
              placeholder="Search by make, model, or year"
              className={`flex-grow bg-transparent border-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                darkMode
                  ? "text-gray-100 placeholder-gray-400"
                  : "text-gray-900 placeholder-gray-500"
              } text-lg`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              type="submit"
              className="bg-rose-800 px-6 text-white hover:bg-rose-900"
            >
              <Search className="w-5 h-5 mr-2" /> Search
            </Button>
          </form>
        </div>

        <div className="mb-20 grid grid-cols-1 gap-5 py-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Car,
              title: "Buy Your Dream Cars",
              description:
                "Thinking of a dream car that you always wanted to buy? Browse our wide range of vehicles to find one that suits you. From SUVs to sedans, we've got you all!",
              action: "Buy Now",
              link: "/marketplace",
            },
            {
              icon: ShoppingBag,
              title: "Sell Your Own Cars",
              description:
                "CarMine allows you to sell your car with ease with our streamlined process in just minutes! Upload your photos, set your price and your car details. You are ready to go!",
              action: "Sell Now",
              link: "/sell",
            },
            {
              icon: Key,
              title: "Car Rentals",
              description:
                "Rent vehicles for any occasion from economy to luxury with flexible plans and availability. CarMine covers you with excellent customer service and car selections.",
              action: "Rent Now",
              link: "/sell",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border p-7 shadow-sm transition-shadow hover:shadow-md ${
                darkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-stone-200 bg-white"
              }`}
            >
              <div className="flex justify-center mb-6">
                <item.icon
                  className={`w-20 h-20 ${
                    darkMode ? "text-rose-300" : "text-rose-800"
                  }`}
                />
              </div>
              <h2
                className={`text-2xl font-bold mb-4 text-center ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {item.title}
              </h2>
              <p
                className={`${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } mb-6 text-center`}
              >
                {item.description}
              </p>
              <Link href={item.link}>
                <Button className="w-full bg-rose-800 py-6 text-lg font-semibold text-white hover:bg-rose-900">
                  {item.action}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <section
          className={`mb-20 rounded-xl border p-6 shadow-sm sm:p-10 ${
            darkMode
              ? "border-gray-700 bg-gray-900"
              : "border-stone-200 bg-white"
          }`}
        >
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">
            Why Choose CarMine?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Quick and easy transactions for all your automotive needs.",
              },
              {
                icon: Shield,
                title: "Quick Support",
                description:
                  "Our team of automotive experts is always ready to assist you.",
              },
              {
                icon: Star,
                title: "Community Driven",
                description:
                  "Join a thriving community of car enthusiasts and experts.",
              },
              {
                icon: Shield,
                title: "Secure Transactions",
                description:
                  "Your safety and security are our top priorities in every deal.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex flex-col items-center text-center ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                } p-6 rounded-xl`}
              >
                <item.icon
                  className={`w-16 h-16 ${
                    darkMode ? "text-rose-300" : "text-rose-800"
                  } mb-4`}
                />
                <h3
                  className={`text-xl font-bold mb-2 ${
                    darkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {item.title}
                </h3>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-xl bg-rose-900 px-6 py-10 text-white sm:px-12">
          <h2 className="mb-5 text-center text-3xl font-semibold tracking-tight">
            Join the CarMine Community
          </h2>
          <p className="mb-8 text-center text-stone-200">
            Create an account to save vehicles and manage your listings.
          </p>
          <div className="flex justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white px-8 py-6 font-semibold text-rose-900 hover:bg-stone-100"
              >
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-24">
          <div className="mb-8 flex flex-col items-center text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-800 dark:text-rose-300">
              From our community
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              What our customers say
            </h2>
          </div>
          <div
            className="testimonial-viewport"
            role="region"
            aria-label="Customer testimonials"
            tabIndex={0}
          >
            <div className="testimonial-track">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="testimonial-group"
                  aria-hidden={copy === 1}
                >
                  {testimonials.map((testimonial) => (
                    <article
                      key={`${copy}-${testimonial.name}`}
                      className={`testimonial-card ${
                        darkMode
                          ? "border-gray-700 bg-gray-900"
                          : "border-stone-200 bg-white"
                      }`}
                    >
                      <Quote
                        className="mb-5 h-5 w-5 text-rose-800 dark:text-rose-300"
                        aria-hidden="true"
                      />
                      <p
                        className={`mb-7 text-base leading-7 ${
                          darkMode ? "text-gray-300" : "text-stone-700"
                        }`}
                      >
                        &ldquo;{testimonial.comment}&rdquo;
                      </p>
                      <p
                        className={`mt-auto text-sm font-semibold ${
                          darkMode ? "text-gray-100" : "text-stone-900"
                        }`}
                      >
                        {testimonial.name}
                      </p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-gray-400">
                        CarMine customer
                      </p>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-stone-500 dark:text-gray-400">
            Pause the carousel by hovering over it or focusing it.
          </p>
        </section>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}
