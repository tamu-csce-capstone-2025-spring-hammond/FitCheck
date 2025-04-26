"use client";

import { useState, useEffect } from "react";
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

interface Listing {
  id: string;
  name: string;
  price: string;
  retailer_id: string;
  category?: string;
  s3url?: string;
  image_url?: string;
  created_at?: string;
}

interface ResaleListing {
  id: string;
  name: string;
  clothing_item_id: string;
}

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  resale_listings?: ResaleListing[];
}

export default function FilterWithItems() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserEmail(data.email);
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!userEmail) return;
      
      try {
        const response = await fetch(`/api/facebook/userproducts/${userEmail}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to fetch user listings: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Raw Facebook API response:', data);
        
        // If no products, set empty listings and return early
        if (!data.products || data.products.length === 0) {
          setListings([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch image URLs and prices for each product
        const listingsWithImages = await Promise.all(
          data.products.map(async (listing: Listing) => {
            try {
              console.log('Processing listing:', listing);
              // Fetch image URL
              const imageResponse = await fetch(`/api/facebook/image/${listing.name}`);
              if (!imageResponse.ok) {
                console.warn(`Failed to fetch image for ${listing.name}:`, imageResponse.status);
                return listing;
              }
              const imageData = await imageResponse.json();
              
              // Fetch price
              const priceResponse = await fetch(`/api/facebook/price/${listing.name}`);
              if (!priceResponse.ok) {
                console.warn(`Failed to fetch price for ${listing.name}:`, priceResponse.status);
                return { ...listing, s3url: imageData.image_url };
              }
              const priceData = await priceResponse.json();
              
              // Get user's clothing items to find the matching item
              const userResponse = await fetch('/api/user/clothing-items');
              const userClothingItems = await userResponse.json();
              console.log('User clothing items response:', userClothingItems);
              
              // Ensure we're working with an array
              const itemsArray = Array.isArray(userClothingItems) ? userClothingItems : [];
              
              // Get the listing name
              const listingName = (listing as Listing).name;
              console.log('Current listing name:', listingName);
              
              // Find the matching clothing item by name
              const matchingClothingItem = itemsArray.find((item: ClothingItem) => {
                console.log('Comparing names:', {
                  listingName,
                  itemName: item.name
                });
                return item.name === listingName;
              });
              
              console.log('Matching clothing item:', matchingClothingItem);
              
              // Fetch resale listing data if we have a matching clothing item
              let created_at = undefined;
              if (matchingClothingItem?.id) {
                console.log('Looking for resale listing with clothing_item_id:', matchingClothingItem.id);
                try {
                  const resaleResponse = await fetch(`/api/created_at/${matchingClothingItem.id}`);
                  if (resaleResponse.ok) {
                    const resaleData = await resaleResponse.json();
                    console.log('Found resale listing:', resaleData);
                    created_at = resaleData.created_at;
                  } else {
                    console.log('No resale listing found for this clothing item');
                  }
                } catch (error) {
                  console.error('Error fetching resale listing:', error);
                }
              }
              
              return {
                ...listing,
                s3url: imageData.image_url,
                price: priceData,
                category: matchingClothingItem?.category || 'Unknown',
                created_at
              };
            } catch (error) {
              console.error(`Error fetching data for ${listing.name}:`, error);
              return listing;
            }
          })
        );
        
        console.log('Final listings with images:', listingsWithImages);
        setListings(listingsWithImages);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchUserListings:', error);
        setListings([]); // Set empty listings on error
      }
    };

    fetchUserListings();
  }, [userEmail]);

  return (
    <div className="container bg-white">
      <div className="flex flex-col space-y-6">
        {/* <div>
          <h2 className="bold">Organize</h2>
        </div> */}

        <div className="flex flex-col lg:flex-row gap-8 bg-white">
          {/* Filters - Desktop */}
          {/* <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Filters</h2>
              <ProductFilters />
            </div>
          </div> */}

          {/* Filters - Mobile */}
          {/* <div className="lg:hidden flex justify-between items-center mb-4">
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
          </div> */}

          {/* Listings */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading your listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <p className="text-xl font-semibold text-gray-600">You haven&apos;t listed any items yet</p>
                <p className="text-gray-500">Start by adding your first item to your listings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  console.log('Rendering listing card:', {
                    name: listing.name,
                    imageUrl: listing.s3url
                  });
                  return (
                    <ListedItemCard
                      key={listing.id}
                      itemName={listing.name}
                      category={listing.category || "Uncategorized"}
                      price={listing.price}
                      href={`/listed-item/${listing.id}`}
                      imageUrl={listing.s3url}
                      createdAt={listing.created_at}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
