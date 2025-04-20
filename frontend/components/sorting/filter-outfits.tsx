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

interface Outfit {
  id: number;
  name: string;
  description: string;
  s3url: string;
  image: string;
  items: ClothingItem[];
  created_at: string;
  updated_at: string;
  user_id: number;
}

export default function FilterOutfits() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [] as string[],
    brand: [] as string[],
    size: [] as string[],
    color: [] as string[],
    tag: [] as string[],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [submitQuery, setSubmitQuery] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);

  // reset everything
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
      const res = await fetch("/api/outfits-by-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedFilters),
      });
      const outfits: Outfit[] = await res.json();
      setFilteredOutfits(outfits);
    } catch (err) {
      console.error("reset error:", err);
    }
  };

  // re-fetch whenever filters change
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/outfits-by-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedFilters),
        });
        const outfits: Outfit[] = await res.json();
        setFilteredOutfits(outfits);
      } catch (err) {
        console.error("filter error:", err);
      }
    };
    load();
  }, [selectedFilters]);

  // optional search
  useEffect(() => {
    if (!submitQuery) return;
    const search = async () => {
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: submitQuery }),
        });
        const outfits: Outfit[] = await res.json();
        setFilteredOutfits(outfits);
      } catch (err) {
        console.error("search error:", err);
      }
    };
    search();
  }, [submitQuery]);

  const handleSearchSubmit = () => setSubmitQuery(searchQuery);
  const handleKeyDown = (e: React.KeyboardEvent) =>
    e.key === "Enter" && setSubmitQuery(searchQuery);

  return (
    <div className="container bg-white">
      {/* Search */}
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 px-4 py-2 border-[1.5px] border-black/80 rounded"
          placeholder="Search for outfits…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleSearchSubmit} className="h-full">
          <Filter className="h-6 w-6" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 mb-4">
        <Button
          onClick={() => setDeleteMode((f) => !f)}
          className="border-heart-red text-heart-red hover:bg-heart-red hover:text-white"
        >
          {deleteMode ? "Exit Delete Mode" : "Delete Outfits"}
        </Button>
        <Button onClick={handleClearSearch} className="border-black hover:bg-black hover:text-white">
          Clear Filters
        </Button>
      </div>

      {/* Main */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-6">
          <p className="bold mb-6">Filters</p>
          <ProductFilters
            selectedFilters={selectedFilters}
            setSelectedFilters={(f) => setSelectedFilters(f as typeof selectedFilters)}
          />
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button className="flex items-center gap-2">
                <Filter className="h-6 w-6" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md overflow-auto">
              <h2 className="text-xl font-semibold mb-6">Filters</h2>
              <ProductFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={(f) =>
                  setSelectedFilters({ ...selectedFilters, ...(f as typeof selectedFilters) })
                }
              />
            </SheetContent>
          </Sheet>
          <Button size="icon">
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Outfit Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.length > 0 ? (
              filteredOutfits.map((o) => (
                <ProductCard
                  key={o.id}
                  itemName={o.description}
                  category="Outfit"
                  imageSrc={o.s3url || o.image}
                  href={`/outfit/${o.id}`}
                  id={o.id}
                  showDeleteButton={deleteMode}
                  onDelete={(id) =>
                    setFilteredOutfits((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <Image src="/images/icons/error.svg" alt="none" width={48} height={48} />
                <p className="mt-4 text-gray-400 italic">
                  No outfits found, try adjusting your filters!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
