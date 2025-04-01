import { useState } from "react";
import Image from "next/image";
import Header from "../components/header";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import DarkButton from "@/components/tags-and-buttons/dark-button";
import CameraModal from "@/components/cameramodal";
export default function AddItem() {
  const [image, setImage] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  // Handle file selection
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "selfie"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "main") {
          setImage(reader.result as string);
        } else {
          setSelfie(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="FitCheck">
      <Header />

      <main className="_site-grid min-h-[80vh] relative mb-64">
        <div className="my-36 _grid-3 h-full">
          <div className="flex flex-col gap-6 px-6 py-12 md:px-16 md:py-24 bg-white shadow-lg rounded-lg border-2 border-gray-200">
            <h1 className=" bold text-center mb-6">
              Upload Clothing Item To Try
            </h1>

            {/* Main Clothing Image Upload */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">
                Upload Item Photo
              </label>
              <div className="relative border-2 border-dashed border-gray-300 p-24 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500">
                {image ? (
                  <Image
                    src={image}
                    alt="Uploaded Item"
                    width={150}
                    height={150}
                    className="rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500 text-center">
                    Tap to upload an image
                  </p>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  capture="environment"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleImageChange(e, "main")}
                />
              </div>
            </div>

            {/* Selfie Upload */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">
                Upload Selfie Wearing Item (Optional)
              </label>
              <div className="relative border-2 border-dashed border-gray-300 p-24 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500">
                {selfie ? (
                  <Image
                    src={selfie}
                    alt="Uploaded Selfie"
                    width={150}
                    height={150}
                    className="rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500 text-center">
                    Tap to upload a selfie
                  </p>
                )}
                <input
                  type="file"
                  name="selfie"
                  accept="image/*"
                  capture="user"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleImageChange(e, "selfie")}
                />
              </div>
            </div>

            <div className="mt-auto">
              <DarkButton text="Add to Inventory" href={`/`} />
            </div>
          </div>
        </div>

        <Navbar
          onAddClick={() => {
            setShowCamera(true);
          }}
        />
      </main>

      <Footer />
      <CameraModal
        isVisible={showCamera}
        onClose={() => setShowCamera(false)}
      />
    </div>
  );
}
