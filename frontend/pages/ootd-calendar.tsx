import OOTDCalendar from "@/components/calendar";
import { useState } from "react";
import { useRouter } from 'next/router';
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DarkButton from "../components/tags-and-buttons/dark-button";
import FilterWithItems from "@/components/sorting/filter-with-items";
import CameraModal from "@/components/cameramodal";

export default function Home() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraClose = () => {
    setShowCamera(false)
    router.reload()
  }
  return (
    <div className="FitCheck bg-white">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className=" _grid-2">
          <div className="my-24">
            <OOTDCalendar></OOTDCalendar>
          </div>
        </div>
        <Navbar
          onAddClick={() => {
            setShowCamera(true);
          }}
        />
      </main>
      <CameraModal isVisible={showCamera} onClose={handleCameraClose} />
    </div>
  );
}
