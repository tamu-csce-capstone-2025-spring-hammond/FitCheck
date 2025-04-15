"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import Footer from "../components/footer";
import DarkButton from "../components/tags-and-buttons/dark-button";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="FitCheck min-h-screen bg-white flex flex-col">
      <Header />

      <main className="_site-grid">
        <div className="_grid-3 min-h-[85vh]">
          {/* Profile Header */}
          <div className="">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 my-24">
              <h1 className="bold text-center md:text-left ">👋 Username</h1>
              <div className="flex gap-4">
                <button className="min-w-48 border border-gray-300 py-2 px-4 rounded-xl hover:bg-gray-100 transition-all">
                  Edit Profile
                </button>
                <button className="min-w-48 border border-gray-300 py-2 px-4 rounded-xl hover:bg-gray-100 transition-all">
                  Log Out
                </button>
              </div>
            </div>

            {/* Profile Info + Closet Preview */}
            <div className="flex flex-col md:flex-row gap-12 flex-1">
              {/* Profile Info */}
              <div className="flex-1 flex flex-col gap-6 text-gray-700 justify-start">
                <p className="">
                  <span className="bold">Email:</span> you@example.com
                </p>
                <p className="">
                  <span className="bold">Items in Closet:</span> 
                </p>
              </div>

              {/* Closet Preview */}
              <div className="flex-1 flex flex-col gap-6">
                <p className="text-gray-500 text-lg">
                  Your digital wardrobe preview 👕✨
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="aspect-square bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm text-4xl">
                    👕
                  </div>
                  <div className="aspect-square bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm text-4xl">
                    👖
                  </div>
                  <div className="aspect-square bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm text-4xl">
                    👟
                  </div>
                  <div className="aspect-square bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm text-4xl">
                    🎩
                  </div>
                  <div className="aspect-square bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm text-4xl">
                    👜
                  </div>
                  <div className="aspect-square bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm text-4xl">
                    🧥
                  </div>
                </div>
                <div className="w-full">
                  <DarkButton text="Back to Closet" href="/" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
