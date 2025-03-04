import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export default function ProductFilters() {
  // State for tracking which filters are open
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
    category: false,
    brand: false,
    size: false,
    color: false,
    price: false,
    tag: false,
  });

  // State for tracking selected filters
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({
    category: [],
    brand: [],
    size: [],
    color: [],
    tag: [],
  });

  // State for price range
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Toggle filter dropdown
  const toggleFilter = (filter: string) => {
    setOpenFilters({
      ...openFilters,
      [filter]: !openFilters[filter],
    });
  };

  // Handle checkbox change
  const handleFilterChange = (type: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = [...prev[type]];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [type]: [...current, value] };
      }
    });
  };

  // Remove a single filter
  const removeFilter = (type: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({
      category: [],
      brand: [],
      size: [],
      color: [],
      tag: [],
    });
    setPriceRange([0, 1000]);
  };

  // Count total active filters
  const activeFilterCount =
    Object.values(selectedFilters).flat().length +
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  // Sample filter options (in a real app, these would come from your data)
  const filterOptions = {
    category: ["Clothing", "Shoes", "Accessories", "Sportswear", "Outerwear"],
    brand: ["Nike", "Adidas", "Puma", "New Balance", "Under Armour", "Reebok"],
    size: ["XS", "S", "M", "L", "XL", "XXL"],
    color: [
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Purple",
      "Orange",
      "Gray",
    ],
    tag: [
      "New Arrival",
      "Sale",
      "Limited Edition",
      "Best Seller",
      "Eco-friendly",
    ],
  };

  return (
    <div className="w-full">
      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Active Filters:</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([type, values]) =>
              values.map((value) => (
                <Badge
                  key={`${type}-${value}`}
                  variant="outline"
                  className="px-2 py-1 rounded-md"
                >
                  {value}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter(type, value)}
                  />
                </Badge>
              ))
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Badge variant="outline" className="px-2 py-1 rounded-md">
                ${priceRange[0]} - ${priceRange[1]}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => setPriceRange([0, 1000])}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Filter sections */}
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFilter("category")}
            className="flex items-center justify-between w-full p-4 text-left font-medium"
          >
            <span>Category</span>
            {openFilters.category ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openFilters.category && (
            <div className="p-4 pt-4 border-t">
              <div className="space-y-2">
                {filterOptions.category.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedFilters.category.includes(category)}
                      onCheckedChange={() =>
                        handleFilterChange("category", category)
                      }
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFilter("brand")}
            className="flex items-center justify-between w-full p-4 text-left font-medium"
          >
            <span>Brand</span>
            {openFilters.brand ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openFilters.brand && (
            <div className="p-4 pt-4 border-t">
              <div className="space-y-2">
                {filterOptions.brand.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedFilters.brand.includes(brand)}
                      onCheckedChange={() => handleFilterChange("brand", brand)}
                    />
                    <Label
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Size Filter */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFilter("size")}
            className="flex items-center justify-between w-full p-4 text-left font-medium"
          >
            <span>Size</span>
            {openFilters.size ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openFilters.size && (
            <div className="p-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-2">
                {filterOptions.size.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedFilters.size.includes(size)}
                      onCheckedChange={() => handleFilterChange("size", size)}
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color Filter */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFilter("color")}
            className="flex items-center justify-between w-full p-4 text-left font-medium"
          >
            <span>Color</span>
            {openFilters.color ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openFilters.color && (
            <div className="p-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.color.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedFilters.color.includes(color)}
                      onCheckedChange={() => handleFilterChange("color", color)}
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ blackColor: color.toLowerCase() }}
                      ></div>
                      <Label
                        htmlFor={`color-${color}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {color}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFilter("price")}
            className="flex items-center justify-between w-full p-4 text-left font-medium"
          >
            <span>Price</span>
            {openFilters.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openFilters.price && (
            <div className="p-4 pt-4 border-t">
              <div className="space-y-4">
                <div className="pt-4">
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="border rounded-md px-3 py-1">
                    <span className="text-sm">$</span>
                    <span className="text-sm">{priceRange[0]}</span>
                  </div>
                  <div className="border rounded-md px-3 py-1">
                    <span className="text-sm">$</span>
                    <span className="text-sm">{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tag Filter */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFilter("tag")}
            className="flex items-center justify-between w-full p-4 text-left font-medium"
          >
            <span>Tag</span>
            {openFilters.tag ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {openFilters.tag && (
            <div className="p-4 pt-4 border-t">
              <div className="space-y-2">
                {filterOptions.tag.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedFilters.tag.includes(tag)}
                      onCheckedChange={() => handleFilterChange("tag", tag)}
                    />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Filters Button (for mobile) */}
      <div className="mt-6 sm:hidden">
        <Button className="w-full">Apply Filters ({activeFilterCount})</Button>
      </div>
    </div>
  );
}
