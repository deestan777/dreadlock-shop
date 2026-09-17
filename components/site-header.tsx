'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigationLinks = [
  { href: "/", label: "Головна" },
  { href: "/kits", label: "Комплекти" },
  { href: "/items", label: "Окремі товари" },
  { href: "/cart", label: "Кошик" },
]

export function SiteHeader() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Dreadlock Kits</div>
          <div className="hidden items-center space-x-4 md:flex">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gray-300">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center md:hidden">
            <Link href="/cart" className="mr-4" aria-label="Відкрити кошик">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            {isMounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Відкрити меню</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col space-y-4">
                    {navigationLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="text-lg font-medium">
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default SiteHeader
