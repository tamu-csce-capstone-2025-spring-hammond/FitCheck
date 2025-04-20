import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/imported-ui/button";
import { Checkbox } from "@/components/imported-ui/checkbox";
import { Label } from "@/components/imported-ui/label";
import { Badge } from "@/components/imported-ui/badge";

interface ProductFiltersProps {
  selectedFilters: Record<string, string[]>;
  // setSelectedFilters: (filters: Record<string, string[]>) => void;
  setSelectedFilters: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
}

export default function ProductFilters({
  selectedFilters,
  setSelectedFilters,
}: ProductFiltersProps) {
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
    category: false,
    brand: false,
    size: false,
    color: false,
  });

  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({
    category: [],
    brand: [],
    size: [],
    color: [],
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const fields = ["category", "brand", "size", "color"];
        const options: Record<string, string[]> = {};

        for (let field of fields) {
          const response = await fetch(`/api/unique-values/${field}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
          });
          const data = await response.json();
          options[field] = data || [];
        }

        console.log("Fetched filter options:", options);
        setFilterOptions(options);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

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
    });
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  const toggleFilter = (filterKey: string) => {
    setOpenFilters((prev) => {
      const newState = { ...prev, [filterKey]: !prev[filterKey] };
      console.log("openFilters state updated:", newState);
      return newState;
    });
  };

  return (
    <div className="w-full">
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="subtext">Active Filters:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-md"
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
                  className="px-2 py-1 text-md rounded-md bg-black"
                >
                  {value}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter(type, value)}
                  />
                </Badge>
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.keys(filterOptions).map((filterKey) => (
          <div key={filterKey} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFilter(filterKey)}
              className="flex items-center justify-between w-full p-4 text-left font-medium"
            >
              <span>
                {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
              </span>
              {openFilters[filterKey] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {openFilters[filterKey] && (
              <div className="p-4 pt-4 border-t">
                <div className="space-y-2">
                  {Array.isArray(filterOptions[filterKey]) &&
                    filterOptions[filterKey].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${filterKey}-${option}`}
                          checked={selectedFilters[filterKey].includes(option)}
                          onCheckedChange={() =>
                            handleFilterChange(filterKey, option)
                          }
                        />
                        <Label
                          htmlFor={`${filterKey}-${option}`}
                          className="text-md font-normal cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
