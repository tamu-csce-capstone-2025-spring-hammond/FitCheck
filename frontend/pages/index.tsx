// import Image from "next/image";
import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DarkButton from "../components/index-components/dark-button";
import FilterWithItems from "@/components/index-components/filter-with-items";
import DateWeatherWidget from "../components/index-components/date-weather-widget";
import CameraModal from "@/components/cameramodal";

export default function Home() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="FitCheck">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className=" _grid-3">
          <div className="grid grid-cols-[1fr] md:grid-cols-[1fr,1fr] my-24">
            <div className="flex flex-col gap-6">
              <h1 className="bold">Welcome To Your Closet, Test User!</h1>
              <div className="flex flex-col md:flex-row gap-4">
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
        <Navbar onAddClick={() => setShowCamera(true)} />
      </main>

      <Footer></Footer>
      <CameraModal isVisible={showCamera} onClose={() => setShowCamera(false)} />
    </div>
  );
}
