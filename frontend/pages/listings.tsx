import { useState } from "react";
import { useRouter } from 'next/router';
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
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
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="my-16 _grid-3">
            <h1 className="bold mb-12 bg-body p-12 text-body-light rounded-t-[10px]">
            My Listings
            </h1>
          <ListingFilterWithItems></ListingFilterWithItems>
        </div>

        <Navbar onAddClick={() => {setShowCamera(true)}}></Navbar>
      </main>

      <Footer></Footer>
      <CameraModal isVisible={showCamera} onClose={handleCameraClose} />
    </div>
  );
}
