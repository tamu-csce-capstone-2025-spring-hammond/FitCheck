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
import ProductCard from "./product-card";

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
  }, [submitQuery]);  // Trigger this effect only when submitQuery changes

  const handleSearchSubmit = () => {
    setSubmitQuery(searchQuery);  // Set submitQuery to trigger search
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSubmitQuery(searchQuery);  // Trigger search on Enter key press
    }
  };

  return (
    <div className="container bg-white">
      <div className="flex flex-col space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="bold">Organize</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 bg-white">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Filters</h2>
              <ProductFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters} />
            </div>
          </div>

          {/* Filters - Mobile */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:max-w-md overflow-auto bg-white"
              >
                <h2 className="text-xl font-semibold mb-6">Filters</h2>
                <ProductFilters
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters} />
              </SheetContent>
            </Sheet>
            <Button size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Bar - Above Product Grid */}
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}  // Trigger search on Enter key press
            />
            <Button onClick={handleSearchSubmit} className="mt-2">Submit Search</Button>  {/* Submit button */}
          </div>

          {/* Product Grid - Placeholder */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    itemName={item.name}
                    category={item.category}
                    href={item.s3url}
                  />
                ))
              ) : (
                <div>No items found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
