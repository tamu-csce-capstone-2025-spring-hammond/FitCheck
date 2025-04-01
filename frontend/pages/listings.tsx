import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import FilterWithItems from "@/components/sorting/filter-with-items";
import CameraModal from "@/components/cameramodal";

export default function Listings() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="FitCheck">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="my-24 _grid-3">
            <h1 className="bold mb-12 bg-body p-12 text-body-light rounded-t-[10px]">
            My Listings
            </h1>
          <FilterWithItems></FilterWithItems>
        </div>

        <Navbar onAddClick={() => {setShowCamera(true)}}></Navbar>
      </main>

      <Footer></Footer>
      <CameraModal isVisible={showCamera} onClose={() => setShowCamera(false)} />
    </div>
  );
}
