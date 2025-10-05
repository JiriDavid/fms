import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "FarmTrack | Farming Management System",
  description:
    "FarmTrack helps farmers manage herds, inventory, finances, and daily farm activities with realtime dashboards and Clerk authentication.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-slate-50 text-slate-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
