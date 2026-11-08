"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, ShoppingCart, Loader2, Lock, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  price: number;
  mileage: number;
  image_url: string;
  listed_date?: string;
  is_rentable?: boolean;
  car_images?: string;
}

interface Category {
  name: string;
  makes: string[];
}

interface DatabaseCar {
  car_id: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_trim?: string;
  car_price: number;
  car_mileage?: number;
  car_images?: string;
  listed_date?: string;
  is_rentable?: boolean;
}

function isDatabaseCar(value: unknown): value is DatabaseCar {
  return (
    typeof value === "object" &&
    value !== null &&
    "car_id" in value &&
    typeof value.car_id === "string" &&
    "car_make" in value &&
    typeof value.car_make === "string" &&
    "car_model" in value &&
    typeof value.car_model === "string" &&
    "car_year" in value &&
    typeof value.car_year === "number" &&
    "car_price" in value &&
    typeof value.car_price === "number"
  );
}

const categories: Category[] = [
  {
    name: "Luxury",
    makes: ["BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Tesla"],
  },
  {
    name: "Sports",
    makes: ["Ferrari", "Lamborghini", "Porsche", "Chevrolet", "Dodge"],
  },
  {
    name: "SUV & Crossover",
    makes: ["Honda", "Toyota", "Ford", "Jeep", "Subaru"],
  },
  {
    name: "Economy",
    makes: ["Toyota", "Honda", "Hyundai", "Kia", "Volkswagen"],
  },
  {
    name: "Truck",
    makes: ["Ford", "Chevrolet", "RAM", "GMC", "Toyota"],
  },
];

// Get all unique makes for search suggestions
// const allMakes = Array.from(
//   new Set(categories.flatMap((category) => category.makes))
// );

export default function MarketplacePage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceWarning, setSourceWarning] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedMake, setSelectedMake] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [page, setPage] = useState(1);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>("newest");
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const getImageUrl = useCallback((car: Car) => {
    const url = car.car_images
      ? car.car_images.startsWith("http") || car.car_images.startsWith("https")
        ? car.car_images
        : `/uploads/${car.car_images}`
      : car.image_url ||
        "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
    return url;
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSourceWarning(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: "30",
        sort: sortOption,
      });
      if (selectedMake) params.set("make", selectedMake);

      const [apiResult, dbResult] = await Promise.allSettled([
        fetch(`/api/car-listings?${params}`, {
          headers: { Accept: "application/json" },
        }),
        fetch("/api/buy"),
      ]);

      if (apiResult.status === "rejected") {
        throw apiResult.reason;
      }

      const apiResponse = apiResult.value;
      if (!apiResponse.ok) {
        throw new Error(
          `Unable to load external vehicle listings (HTTP ${apiResponse.status}).`
        );
      }

      const apiData = await apiResponse.json();
      setHasMore(Boolean(apiData.hasMore));

      const apiCars: Car[] = (apiData.records ?? []).map(
        (car: {
          id: string;
          make: string;
          model: string;
          year: number;
          trim: string;
          price: number;
          mileage: number;
          primaryPhotoUrl: string;
          listed_date: string;
        }) => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          trim: car.trim,
          price: car.price,
          mileage: car.mileage,
          image_url: car.primaryPhotoUrl,
          listed_date: car.listed_date,
        })
      );

      let dbData: DatabaseCar[] = [];
      if (dbResult.status === "fulfilled" && dbResult.value.ok) {
        try {
          const result: unknown = await dbResult.value.json();
          if (Array.isArray(result) && result.every(isDatabaseCar)) {
            dbData = result;
          } else {
            setSourceWarning(
              "Your own vehicle listings could not be read. Showing external inventory."
            );
          }
        } catch (dbError) {
          console.error("Unable to read user vehicle listings:", dbError);
          setSourceWarning(
            "Your own vehicle listings could not be read. Showing external inventory."
          );
        }
      } else {
        setSourceWarning(
          "Your own vehicle listings are temporarily unavailable. Showing external inventory."
        );
      }

      const dbCars: Car[] = dbData.map((car) => ({
          id: car.car_id,
          make: car.car_make,
          model: car.car_model,
          year: car.car_year,
          trim: car.car_trim || "",
          price: car.car_price,
          mileage: car.car_mileage || 0,
          image_url: "",
          car_images: car.car_images,
          listed_date: car.listed_date || new Date().toISOString(),
          is_rentable: car.is_rentable,
        }));

      const allCars = [...apiCars, ...dbCars];
      const sortedCars = sortCars(allCars, sortOption);

      setCars((prevCars) =>
        page === 1 ? sortedCars : [...prevCars, ...sortedCars]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cars");
    } finally {
      setLoading(false);
    }
  }, [page, selectedMake, sortOption]);

  const sortCars = (cars: Car[], sortOption: string) => {
    return [...cars].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.listed_date || "").getTime() -
            new Date(a.listed_date || "").getTime()
          );
        case "oldest":
          return (
            new Date(a.listed_date || "").getTime() -
            new Date(b.listed_date || "").getTime()
          );
        case "price_high":
          return b.price - a.price;
        case "price_low":
          return a.price - b.price;
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    let results = cars;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        (car) =>
          (car.make && car.make.toLowerCase().includes(searchLower)) ||
          (car.model && car.model.toLowerCase().includes(searchLower)) ||
          String(car.year).includes(searchLower) ||
          (car.trim && car.trim.toLowerCase().includes(searchLower))
      );
    }

    if (selectedMake) {
      const makeLower = selectedMake.toLowerCase();
      results = results.filter((car) => car.make.toLowerCase() === makeLower);
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      results = results.filter(
        (car) => car.price >= (min || 0) && car.price <= (max || Infinity)
      );
    }

    setFilteredCars(results);
  }, [cars, searchTerm, selectedMake, priceRange]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleSearch = useCallback(() => {
    setPage(1);
    setIsSearchOpen(false);
    const params = new URLSearchParams(window.location.search);
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }, [searchTerm]);

  const handleMakeSelect = useCallback((make: string) => {
    setSelectedMake((prevMake) => prevMake === make ? "" : make);
    setSearchTerm("");
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  const handleViewDetails = (carId: string) => {
    if (isAuthenticated) {
      router.push(`/marketplace/${carId}`);
    } else {
      router.push("/signin");
    }
  };

  const renderCarCard = (car: Car) => (
    <article className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="relative w-full h-48">
        <Image
          src={getImageUrl(car)}
          alt={`${car.make} ${car.model}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            // Cast the event target to HTMLImageElement
            const img = e.target as HTMLImageElement;
            // Only update if the current src isn't already the placeholder
            if (
              img.src !==
              "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image"
            ) {
              img.src =
                "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
            }
          }}
          priority={false}
        />
      </div>
      <div className="p-5">
        <h3 className="mb-1 text-lg font-semibold tracking-tight">
          {car.make} {car.model} {car.year}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{car.trim}</p>
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-rose-800 dark:text-rose-300">
            {car.price > 0 ? `$${car.price.toLocaleString()}` : "Contact for price"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {car.mileage > 0 ? `${car.mileage.toLocaleString()} miles` : "N/A"}
          </p>
        </div>
        {car.listed_date && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Listed: {new Date(car.listed_date).toLocaleDateString()}
          </p>
        )}
        {car.is_rentable !== undefined && (
          <p className="text-sm mt-2">
            <span
              className={`px-2 py-1 rounded-full ${
                car.is_rentable
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {car.is_rentable ? "Available for Rent" : "Purchase Only"}
            </span>
          </p>
        )}
        <Button
          className="mt-4 w-full bg-rose-800 text-white hover:bg-rose-900"
          onClick={() => handleViewDetails(car.id)}
        >
          {isAuthenticated ? (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Details
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Sign In to View
            </>
          )}
        </Button>
      </div>
    </article>
  );

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark" : ""
      } bg-stone-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
    >
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        unreadMessages={0}
        onLogout={() => console.log("Logout clicked")}
      />

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 border-b border-stone-200 pb-7 dark:border-gray-800">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-800 dark:text-rose-300">The CarMine marketplace</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a car that fits your life.</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-gray-400">Browse local listings, compare details, and narrow your search by make, price, or newest arrivals.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-stone-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold"><SlidersHorizontal className="h-4 w-4 text-rose-800" /> Browse by make</h2>
              <Accordion
                type="multiple"
                defaultValue={categories.map((_, index) => `category-${index}`)}
                className="w-full"
              >
                {categories.map((category, index) => (
                  <AccordionItem key={index} value={`category-${index}`}>
                    <AccordionTrigger className="text-left">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 px-1 pb-2">
                        {category.makes.map((make) => (
                          <Badge
                            key={make}
                            variant={
                              selectedMake.toLowerCase() === make.toLowerCase()
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer ${selectedMake.toLowerCase() === make.toLowerCase() ? "border-rose-800 bg-rose-800 text-white hover:bg-rose-900" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"}`}
                            onClick={() => handleMakeSelect(make)}
                          >
                            {make}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
          </aside>

          <section className="min-w-0">
            <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5">
              <Label htmlFor="search" className="mb-2 block text-sm font-medium">Search listings</Label>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
                <div className="relative w-full">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Try a make, model, or trim"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsSearchOpen(Boolean(e.target.value.trim()));
                    }}
                    onFocus={() => setIsSearchOpen(Boolean(searchTerm.trim()))}
                    onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 150)}
                    className="h-11 w-full border-stone-300 bg-stone-50 pl-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                  {isSearchOpen && searchTerm.trim() && (
                    <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {filteredCars.slice(0, 6).map((car) => (
                        <button
                          key={car.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setSearchTerm(`${car.year} ${car.make} ${car.model}`);
                            setIsSearchOpen(false);
                          }}
                          className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-gray-800"
                        >
                          <span className="font-medium">{car.year} {car.make} {car.model}</span>
                          {car.trim && <span className="ml-2 text-stone-500">{car.trim}</span>}
                        </button>
                      ))}
                      {filteredCars.length === 0 && <p className="px-3 py-2 text-sm text-stone-500">No matching listings on this page.</p>}
                    </div>
                  )}
                </div>

                <Select
                  value={sortOption}
                  onValueChange={(value) => {
                    setSortOption(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`h-11 w-full ${
                      darkMode
                        ? "bg-gray-700 text-white"
                        : "border-stone-300 bg-stone-50 text-gray-900"
                    }`}
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price_high">High to Low</SelectItem>
                    <SelectItem value="price_low">Low to High</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priceRange || "all"}
                  onValueChange={(value) =>
                    setPriceRange(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger
                    className={`h-11 w-full ${
                      darkMode
                        ? "bg-gray-700 text-white"
                        : "border-stone-300 bg-stone-50 text-gray-900"
                    }`}
                  >
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-10000">$0 - $10,000</SelectItem>
                    <SelectItem value="10000-20000">
                      $10,000 - $20,000
                    </SelectItem>
                    <SelectItem value="20000-30000">
                      $20,000 - $30,000
                    </SelectItem>
                    <SelectItem value="30000-100000">
                      $30,000 - $100,000
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-11 bg-rose-800 px-5 text-white hover:bg-rose-900"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center mb-8">{error}</div>
            )}
            {sourceWarning && (
              <p
                role="status"
                className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              >
                {sourceWarning}
              </p>
            )}

            <p className="mb-4 text-sm text-stone-600 dark:text-gray-400">{filteredCars.length} {filteredCars.length === 1 ? "vehicle" : "vehicles"} shown</p>
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCars.map((car) => (
                  <div key={car.id}>{renderCarCard(car)}</div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  No cars found. Try adjusting your search criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedMake("");
                    setPriceRange("");
                    setSortOption("newest");
                    setPage(1);
                  }}
                  className="bg-rose-800 text-white hover:bg-rose-900"
                >
                  Reset Filters
                </Button>
              </div>
            )}

            {hasMore && filteredCars.length > 0 && !loading && (
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  onClick={loadMore}
                  className="bg-rose-800 text-white hover:bg-rose-900"
                >
                  Load More
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center mt-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
}
