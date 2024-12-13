import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      
      <main className="flex items-center justify-center min-h-screen">
        <div className="relative w-40 h-40">
          <Image src="/profile.JPG"
            alt="Profile" 
            layout="fill"
            objectFit="cover"
            className="rounded-full border-4 border-blue-500"
          />
        </div>
        <div className="bg-blue-600 text-white py-4 shadow-md">
          <h1 className="text-center text-2xl font-bold">Mukesh Mahara</h1>
          <p className="text-center text-sm">Ruby on Rails Developer | Software Engineer</p>
        </div>
      </main>
    </div>
  );
}
