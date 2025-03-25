// filepath: frontend/pages/product/[id].tsx
import Tag from "@/components/tags-and-buttons/tag";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import LightButton from "@/components/tags-and-buttons/light-button";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="FitCheck">
      <Header></Header>

      <main className="_site-grid min-h-[90vh] relative mb-64">
        <div className=" _grid-3">
          <div className="my-24 grid grid-cols-1 md:grid-cols-2 gap-6 relative bg-white">
            {/* Left column - Images */}
            <div className="space-y-4">
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

            {/* Right column - Product details */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h1 className="bold">Product ID: {id}</h1>
                <DarkButton text="Edit Item" href={`/edit-item/${id}`} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Tag text="Small" />
                <Tag text="Blue" />
              </div>

              <hr className="my-4" />

              {/* Description */}
              <p className="mb-6">
                Lorem ipsum odor amet, consectetuer adipiscing elit. Mollis
                penatibus per conubia finibus auctor maximus; nascetur aptent.
                Arcu tellus tortor fermentum tristique varius orci.
              </p>

              <hr className="my-4" />

              {/* Dates */}
              <div className="space-y-2 mb-6">
                <p className="italic">Last Worn: mm/dd/yyy</p>
                <p className="italic">Date Archived: mm/dd/yyy</p>
              </div>

              <hr className="my-4" />

              {/* List item button */}
              <div className="mt-12">
                <LightButton text="List Item" href="/profile" />
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
