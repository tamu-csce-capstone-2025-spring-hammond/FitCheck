// filepath: frontend/pages/product/[id].tsx
import Tag from "@/components/tags-and-buttons/tag";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import LightButton from "@/components/tags-and-buttons/light-button";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import PlatformTracker from "@/components/platform-tracker";

// Sample data (to be fetched dynamically later)
const platformStatuses = [
  {
    platform: "Depop",
    status: "listed",
    analytics: { likes: 28, watchlistAdds: 3 },
    platformUrl: "https://depop.com/item/xyz",
  },
  {
    platform: "eBay",
    status: "offer_received",
    offerDetails: {
      price: 40,
      buyer: "vintageFan88",
    },
    analytics: { likes: 12, watchlistAdds: 1 },
    platformUrl: "https://ebay.com/item/abc",
  },
];

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="FitCheck">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className=" _grid-3">
          <div className="my-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative bg-white">

            {/* LEFT column - Product details */}
            <div className="flex flex-col md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h1 className="bold">Listed Product: {id}</h1>
              </div>

              <div>
                <PlatformTracker platforms={platformStatuses} />
              </div>

              <hr className="my-4" />

              {/* Description */}
              <div className="flex justify-between items-center my-4">
                <h2 className="mb-6">Item Details</h2>
                <DarkButton
                  text="Edit Listing Info"
                  href={`/edit-item/${id}`}
                />
              </div>

              <hr className="my-4" />
            </div>

            {/* RIGHT column - Images */}
            <div className="flex md:flex-col flex-row align-center justify-start gap-4">
              <div className="border border-gray-100 bg-gray-50">
                <Image
                  src=""
                  alt="Denim jacket laid flat"
                  width={500}
                  height={500}
                  className="w-full object-contain"
                />
              </div>
              <div className="border border-gray-100 bg-gray-50">
                <Image
                  src=""
                  alt="Denim jacket being worn"
                  width={500}
                  height={500}
                  className="w-full object-contain"
                />
              </div>
            </div>

          </div>
        </div>

        <Navbar></Navbar>
      </main>

      <Footer></Footer>
    </div>
  );
}
