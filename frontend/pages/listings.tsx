import { useState } from "react";
import { useRouter } from 'next/router';
import Header from "@/components/header";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import ListingFilterWithItems from "@/components/sorting/listings-filter-with-items";
import CameraModal from "@/components/cameramodal";

export default function Listings() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraClose = () => {
    setShowCamera(false)
    router.reload()
  }

  return (
    <div className="FitCheck">
      <Header />
      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="my-16 _grid-3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="bold">Your Listings</h1>
          </div>
          <ListingFilterWithItems />
        </div>
        <Navbar />
      </main>
      <Footer />
      <CameraModal isVisible={showCamera} onClose={handleCameraClose} />
    </div>
  );
}
