"use client";

import { useState } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import { Button } from "@/components/imported-ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/imported-ui/sheet";
import ProductFilters from "./listings-product-filters";
import Link from "next/link";
import ListedItemCard from "./listed-item-card";

export default function FilterWithItems() {
  const [filtersOpen, setFiltersOpen] = useState(false);
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
              <ProductFilters />
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
                <ProductFilters />
              </SheetContent>
            </Sheet>
            <Button size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Grid - Placeholder */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Link key={i} href={`/listed-item/${i}`} passHref>
                  {/* <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-muted"></div>
                    <div className="p-4">
                      <p className="title">Listed Item</p>
                      <p className="text-muted-foreground text-sm">Date Listed: </p>
                    </div>
                  </div> */}
                  <ListedItemCard
                    key={i}
                    itemName="Listed Item Name"
                    category="category"
                    price="$10.50"
                    href={`/listed-item/${i}`}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
