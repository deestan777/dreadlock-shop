import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/site-header"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Dreadlock Kits Shop",
  description: "Customize your perfect dreadlock kit",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <CartProvider>
          <SiteHeader />
          <main className="container mx-auto px-6 py-8">{children}</main>
          <footer className="bg-gray-800 text-white mt-12">
            <div className="container mx-auto px-6 py-4">
              <p className="text-center">&copy; 2025 Dreadlock Kits Shop. Всі права захищені.</p>
            </div>
          </footer>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
