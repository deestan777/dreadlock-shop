import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Dreadlock Kits Shop",
  description: "Customize your perfect dreadlock kit",
    generator: 'v0.dev'
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
          <header className="bg-gray-800 text-white">
            <nav className="container mx-auto px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">Dreadlock Kits</div>
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/" className="hover:text-gray-300">
                    Головна
                  </Link>
                  <Link href="/kits" className="hover:text-gray-300">
                    Комплекти
                  </Link>
                  <Link href="/items" className="hover:text-gray-300">
                    Окремі товари
                  </Link>
                  <Link href="/cart" className="hover:text-gray-300">
                    Кошик
                  </Link>
                </div>
                <div className="md:hidden flex items-center">
                  <Link href="/cart" className="mr-4">
                    <ShoppingCart className="h-6 w-6" />
                  </Link>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Відкрити меню</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                      <nav className="flex flex-col space-y-4">
                        <Link href="/" className="text-lg font-medium">
                          Головна
                        </Link>
                        <Link href="/kits" className="text-lg font-medium">
                          Комплекти
                        </Link>
                        <Link href="/items" className="text-lg font-medium">
                          Окремі товари
                        </Link>
                        <Link href="/cart" className="text-lg font-medium">
                          Кошик
                        </Link>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </nav>
          </header>
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



import './globals.css'