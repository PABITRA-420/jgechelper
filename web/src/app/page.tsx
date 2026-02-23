import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <Hero />
    </main>
  );
}
