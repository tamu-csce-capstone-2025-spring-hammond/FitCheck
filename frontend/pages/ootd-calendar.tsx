import OOTDCalendar from "@/components/calendar";
import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DarkButton from "../components/tags-and-buttons/dark-button";
import FilterWithItems from "@/components/sorting/filter-with-items";

export default function Home() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="FitCheck bg-white">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className=" _grid-3">
          <OOTDCalendar></OOTDCalendar>
        </div>
        <Navbar
          onAddClick={() => {
            setShowCamera(true);
          }}
        />
      </main>
    </div>
  );
}
