import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DarkButton from "../components/tags-and-buttons/dark-button";
import FilterWithItems from "@/components/sorting/filter-with-items";
import DateWeatherWidget from "../components/index-components/date-weather-widget";
import CameraModal from "@/components/cameramodal";

export default function Home() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [userData, setUserData] = useState({ name: "..." });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleCameraClose = () => {
    setShowCamera(false)
    router.reload()
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        console.log('Fetching user data...');
        const response = await fetch('/api/me');
        
        console.log('Response status:', response.status);
        
        if (response.status === 401) {
          // Redirect to login page if not authenticated
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Failed to fetch user: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received user data:', data);
        setUserData(data);
        setError("");
      } catch (error) {
        console.error('Error fetching user:', error);
        setError("Unable to load user data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="FitCheck bg-white">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="_grid-3">
          <div className="grid grid-cols-[1fr] md:grid-cols-[1fr,1fr] mt-16 mb-16">
            <div className="flex flex-col gap-6">
              <h1 className="bold">
                Welcome To Your Closet, {error ? "Guest" : userData.name}!
              </h1>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <DarkButton text="Get Inspired" href="/profile" />
                <DarkButton text="Add My OOTD" href="/profile" />
              </div>
            </div>
            <div className="mt-12 md:mt-0 md:ml-24 flex flex-col gap-4 md:items-end justify-end">
              <DateWeatherWidget />
            </div>
          </div>

          <FilterWithItems></FilterWithItems>
        </div>
        <Navbar onAddClick={() => {setShowCamera(true)}} />
      </main>

      <Footer></Footer>
      <CameraModal isVisible={showCamera} onClose={handleCameraClose} />
    </div>
  );
}