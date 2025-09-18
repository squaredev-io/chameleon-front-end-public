import { Metadata } from "next";
import "../styles/globals.css";
import HeaderLayout from "../components/HeaderLayout/HeaderLayout";
import StoreProvider from "@/lib/Provider/StoreProvider";

export const metadata = {
  title: "Chameleon",
  description: "The Chameleon EU project's ADSS"
} as Metadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <StoreProvider>
      <body>
      <main className={`font-brandon text-base`}>
        <HeaderLayout>
          {children}
        </HeaderLayout>
      </main>
      </body>
    </StoreProvider>
    </html>
  );
}
