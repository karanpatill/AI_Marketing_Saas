import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-white min-h-screen flex flex-col justify-between">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}
