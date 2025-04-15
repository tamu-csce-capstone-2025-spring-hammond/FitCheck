"use client";

import { useState, useEffect } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import { Button } from "@/components/imported-ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/imported-ui/sheet";
import ProductFilters from "./product-filters";
import ProductCard from "./item-card";
import Image from "next/image";

interface ClothingItem {
  brand: string;
  category: string;
  color: string;
  created_at: string;
  description: string;
  id: number;
  last_worn: string;
  name: string;
  s3url: string;
  size: string;
  user_id: number;
}

export default function FilterWithItems() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    brand: [],
    size: [],
    color: [],
    tag: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [submitQuery, setSubmitQuery] = useState(""); // Separate state to track submit action

  const handleClearSearch = async () => {
    setSearchQuery("");
    setSubmitQuery("");
    setSelectedFilters({
      category: [],
      brand: [],
      size: [],
      color: [],
      tag: [],
    });

    try {
      const response = await fetch("/api/by-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: [],
          brand: [],
          size: [],
          color: [],
          tag: [],
        }),
      });
      const data = await response.json();
      setFilteredItems(data);
    } catch (error) {
      console.error("Error resetting items:", error);
    }
  };

  // Fetch filtered items when filters change
  useEffect(() => {
    const fetchFilteredItems = async () => {
      try {
        const response = await fetch("/api/by-field", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedFilters),
        });
        const data = await response.json();
        console.log("Filtered items:", data); // Log the filtered items
        setFilteredItems(data);
      } catch (error) {
        console.error("Error fetching filtered items:", error);
      }
    };
    fetchFilteredItems();
  }, [selectedFilters]);

  useEffect(() => {
    // Only fetch search results when submitQuery changes
    const fetchSearchResults = async () => {
      if (submitQuery) {
        try {
          const response = await fetch("/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: submitQuery }),
          });
          const data = await response.json();
          console.log("Search results:", data); // Log the search results
          setFilteredItems(data);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      }
    };

    // Call the fetch function only if the query is not empty
    if (submitQuery) {
      fetchSearchResults();
    }
  }, [submitQuery]); // Trigger this effect only when submitQuery changes

  const handleSearchSubmit = () => {
    setSubmitQuery(searchQuery); // Set submitQuery to trigger search
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setSubmitQuery(searchQuery); // Trigger search on Enter key press
    }
  };

  return (
    <div className="container bg-white">
      <div className="w-full flex flex-row gap-2 mb-2">
        <input
          type="text"
          className="w-full px-4 py-2 border-[1.5px] border-black/80 rounded "
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleSearchSubmit}
          className="border-0 shadow-none align-center h-full hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </Button>{" "}
      </div>
      <div className="flex w-full mt-4 justify-end">
        <Button
          onClick={handleClearSearch}
          className=" mt-2 h-full border-heart-red border-[1px]  hover:bg-heart-red "
        >
          <p className=" text-heart-red text-lg hover:text-white">
            Clear Search Results
          </p>
        </Button>
      </div>

      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="bold">Organize</h2>
        </div>
        <hr></hr>

        <div className="flex flex-col lg:flex-row gap-8 bg-white">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <p className="bold mb-6">Filters</p>
              <ProductFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={(filters) =>
                  setSelectedFilters(filters as typeof selectedFilters)
                }
              />
            </div>
          </div>

          {/* Filters - Mobile */}
          <div className="lg:hidden flex justify-between items-center mb-4  ">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button className="flex items-center gap-2 ">
                  {/* <Filter className="h-12 w-12" /> */}
                  <svg
                    className="!w-6 !h-6"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path d="M0 3H16V1H0V3Z" fill="#000000"></path>{" "}
                      <path d="M2 7H14V5H2V7Z" fill="#000000"></path>{" "}
                      <path d="M4 11H12V9H4V11Z" fill="#000000"></path>{" "}
                      <path d="M10 15H6V13H10V15Z" fill="#000000"></path>{" "}
                    </g>
                  </svg>
                  <p>Filters</p>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:max-w-md overflow-auto bg-white"
              >
                <h2 className="text-xl font-semibold mb-6">Filters</h2>
                <ProductFilters
                  selectedFilters={selectedFilters}
                  setSelectedFilters={(filters) => {
                    setSelectedFilters({
                      ...selectedFilters,
                      ...(filters as typeof selectedFilters),
                    });
                  }}
                />
              </SheetContent>
            </Sheet>
            <Button size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Grid - Placeholder */}
          <div className="flex-1 relative">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    itemName={item.description}
                    category={item.category}
                    imageSrc={item.s3url}
                    href={`/item/${item.id}`}
                  />
                ))
              ) : (
                <div className="absolute inset-0 top-24 flex flex-col items-center justify-center">
                  <Image
                    src="/images/icons/error.svg"
                    alt="No items found"
                    width={48}
                    height={48}
                    className="mx-auto"
                  />
                  <p className="text-center text-gray-400 text-md italic mt-4">
                    No items found, try something new!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
