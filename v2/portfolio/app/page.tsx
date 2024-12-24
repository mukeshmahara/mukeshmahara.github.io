'use client'
import Image from "next/image";

import { useEffect, useRef } from "react";
import Sidebar from "./components/sidebar";
import { sidebarItems } from "./data/sidebarItems";
import Header from "./components/header";
import Footer from "./components/footer";

export default function Home() {
  const sectionsRef = useRef<HTMLElement[]>([]); // Array of section references
  const currentSection = useRef<number>(0); // Current section index

  const scrollToSection = (index: number) => {
    if (sectionsRef.current[index]) {
      sectionsRef.current[index].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && currentSection.current < sectionsRef.current.length - 1) {
        currentSection.current++;
      } else if (event.deltaY < 0 && currentSection.current > 0) {
        currentSection.current--;
      }
      scrollToSection(currentSection.current);
    };

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
  return (
    <div>

      <main className="flex items-start min-h-screen">
        <Header />

        <Sidebar items={sidebarItems} />

      </main>
        <Footer />

    </div>
  );
}
