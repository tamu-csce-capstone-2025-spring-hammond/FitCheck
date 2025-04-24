import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DarkButton from "@/components/tags-and-buttons/dark-button";

export default function EBayAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID when component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setUserId(data.id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  // Check if we're in the callback phase
  useEffect(() => {
    const { code } = router.query;
    if (code && userId) {
      handleCallback(code as string);
    }
  }, [router.query, userId]);

  const handleCallback = async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ebay/callback", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with eBay");
      }

      const data = await response.json();
      setSuccess("Successfully connected to eBay!");
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const connectToEBay = async () => {
    if (!userId) {
      setError("Please log in first");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ebay/auth/url");
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error getting auth URL:", errorData);
        throw new Error(errorData.detail || "Failed to get eBay authorization URL");
      }

      const data = await response.json();
      console.log("Auth URL:", data.auth_url);
      
      // Verify the URL looks correct
      if (!data.auth_url.includes("auth.sandbox.ebay.com")) {
        console.error("Invalid auth URL format");
        throw new Error("Invalid authorization URL format");
      }

      window.location.href = data.auth_url;
    } catch (err) {
      console.error("Error in connectToEBay:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="FitCheck min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex flex-1 gap-8 flex-col items-center justify-center p-12">
        <div className="w-full max-w-2xl bg-gray-50 p-12 rounded-xl shadow-md border border-gray-200">
          <h1 className="font-bold mb-6 text-center text-2xl">
            Connect with eBay
          </h1>

          <div className="flex flex-col gap-6 items-center">
            <p className="text-gray-600 text-center">
              Connect your eBay account to start listing items for sale.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                {success}
              </div>
            )}

            <DarkButton
              text={isLoading ? "Connecting..." : "Connect with eBay"}
              onClick={connectToEBay}
              disabled={isLoading || !userId}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 