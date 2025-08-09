"use client";

import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React, { useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0 h-screen overflow-y-auto custom-scrollbar">
        <ThemeProvider>
          <div className="relative flex flex-col w-full min-h-screen dark:bg-gray-900">
            {/* Logo section at the top */}
            <div className="w-full py-6 flex justify-center items-center mt-8">
              <div className="relative flex flex-col items-center z-1">
                {!imageError ? (
                  <Image
                    width={231}
                    height={48}
                    src="/images/logo/welcome.jpeg"
                    alt="Logo"
                    style={{
                      width: "130px", height: "130px",
                      borderRadius: "20px"
                    }}
                    priority
                    onError={() => setImageError(true)}
                  />
                ) : (
                  // Fallback when image fails to load
                  <div className="h-12 flex items-center justify-center px-4 py-2">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                      ROOM EIGHT
                    </h1>
                  </div>
                )}
                <p className="text-center text-gray-400 dark:text-white/60 mt-2">
                  ROOM EIGHT Admin Panel
                </p>
              </div>
            </div>

            {/* Main children content below */}
            <div className="flex-grow w-full flex justify-center items-start">
              {children}
            </div>

            {/* Theme Toggle */}
            <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div>
          </div>
        </ThemeProvider>
      </div>
    </>
  );
}

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
  }
`;
