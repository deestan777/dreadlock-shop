import type { Metadata } from "next"
import { CartProvider } from "@/lib/cart-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Dreadlock Shop",
  description: "Premium dreadlock care products and kits.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk" className="dark">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
