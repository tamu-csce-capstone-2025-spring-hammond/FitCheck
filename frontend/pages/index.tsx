import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DateWeatherWidget from "../components/index-components/date-weather-widget";
import CameraModal from "@/components/cameramodal";
import FilterWithItems from "@/components/sorting/filter-with-items";
import FilterOutfits from "@/components/sorting/filter-outfits";
import ToggleSlider from "../components/tags-and-buttons/toggle-slider";
import WeeklyWeatherWidget from "../components/index-components/week-weather-widget";
import Image from "next/image";
export default function Home() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [userData, setUserData] = useState({ name: "..." });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterOutfits, setShowFilterOutfits] = useState(false);

  const handleCameraClose = () => {
    setShowCamera(false);
    router.reload();
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/me");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user: ${errorText}`);
        }
        const data = await response.json();
        setUserData(data);
        setError("");
      } catch (error) {
        setError("Unable to load user data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="FitCheck bg-white">
      <Header />

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="_grid-3">
          <div className="grid grid-cols-1 md:grid-cols-2 mt-16 mb-16 gap-8">
            <div className="flex flex-col relative">
              <h1 className="bold max-w-[15ch]">
                Welcome To Your Closet, {error ? "Guest" : userData.name}!
              </h1>
              {error && <p className="text-red-500">{error}</p>}

              <Image
                src="/images/index-decor-1.svg"
                width={250}
                height={250}
                alt="Closet"
                className="absolute opacity-5 top-72 left-0 sm:left-36 md:top-48 md:left-64 -z-1 -rotate-[20deg]"
              />
              <Image
                src="/images/smile.svg"
                width={250}
                height={250}
                alt="Closet"
                className="absolute opacity-5 top-0 left-0 -z-1 rotate-[20deg]"
              />
              <div className="flex flex-col gap-2 mt-12 md:mt-auto">
                <div className="flex items-center justify-between">
                  <ToggleSlider
                    isOn={showFilterOutfits}
                    onToggle={() => setShowFilterOutfits((prev) => !prev)}
                  />
                </div>
                <p className="text-gray-500 text-lg italic">
                  {showFilterOutfits
                    ? "Curated outfit combinations you've created."
                    : "All the individual clothing items in your closet."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:items-end justify-end z-10">
              <DateWeatherWidget />
              <WeeklyWeatherWidget />
            </div>
          </div>

          <div className="flex flex-col gap-6 transition-opacity duration-300 ease-in-out">
            {showFilterOutfits ? <FilterOutfits /> : <FilterWithItems />}
          </div>
        </div>

        <Navbar onAddClick={() => setShowCamera(true)} />
      </main>

      <Footer />
      <CameraModal isVisible={showCamera} onClose={handleCameraClose} />
    </div>
  );
}
