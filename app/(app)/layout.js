import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
