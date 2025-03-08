'use client'
import Image from "next/image";

import { useEffect, useRef } from "react";
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
      <div className="card border-left-1">


        <section className=" bg-gray-800 h-screen">
          <div className="flex max-w-fit max-w-max ">

            <p className="text-lg relative top-3 left-4">Mukesh </p>
          </div>
          <div className="h-screen flex">world</div>
          <Footer />
        </section>


      </div >
    </div >
  );
}
