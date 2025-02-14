import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Navigation } from "~/components/navigation";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Riqra Challenge",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 p-8">{children}</main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
