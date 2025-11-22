import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
