"use client";

import { use, useState, useEffect } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import { Button } from "@/components/imported-ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/imported-ui/sheet";
import ProductFilters from "./product-filters";
// import Link from "next/link";
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
        console.log(data)

        setFilteredItems(data);
      } catch (error) {
        console.error("Error fetching filtered items:", error);
      }
    };
    fetchFilteredItems();
  }, [selectedFilters]);

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
                  setSelectedFilters={setSelectedFilters}/>
              </SheetContent>
            </Sheet>
            <Button size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
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
                <div>No items found</div> // Handle the case where no items match the filters
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
