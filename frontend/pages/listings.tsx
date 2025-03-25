import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import FilterWithItems from "@/components/sorting/filter-with-items";

export default function Listings() {
  return (
    <div className="FitCheck">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className="my-24 _grid-3">
          <h1 className="bold mb-12 bg-body p-12 text-body-light">
            My Listings
          </h1>
          <FilterWithItems></FilterWithItems>
        </div>

        <Navbar></Navbar>
      </main>

      <Footer></Footer>
    </div>
  );
}
