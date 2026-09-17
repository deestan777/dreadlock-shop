"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"

const kits = [
  { id: 1, name: "Початковий комплект", price: 999, image: "/products/starter-kit.png", label: "Для старту" },
  { id: 2, name: "Професійний комплект", price: 1499, image: "/products/pro-kit.png", label: "Для майстрів" },
  { id: 3, name: "Преміум комплект", price: 1999, image: "/products/premium-kit.png", label: "Повний догляд" },
  { id: 4, name: "Комплект для догляду", price: 799, image: "/products/care-kit.png", label: "Щоденний ритуал" },
]

export default function Home() {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (kit: (typeof kits)[0]) => {
    addItem({ id: kit.id, name: kit.name, price: kit.price, quantity: 1 })
    toast({
      title: "Товар додано до кошика",
      description: `${kit.name} успішно додано до вашого кошика.`,
    })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="hero-grid relative -mx-6 overflow-hidden border-b border-border px-6 py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">Догляд, що має характер</p>
          <h1 className="font-display text-balance text-5xl leading-tight tracking-tight text-foreground md:text-7xl">
            Все для твоїх дредів
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Інструменти й засоби, зібрані для впевненого старту та щоденного догляду.
          </p>
        </div>
      </section>

      <section className="py-12" aria-labelledby="catalog-title">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">Колекція</p>
            <h2 id="catalog-title" className="font-display text-4xl text-foreground">Готові комплекти</h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">{kits.length} набори</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kits.map((kit) => (
            <Card key={kit.id} className="product-card group border-border bg-card">
              <Link href={`/product/${kit.id}`} className="block overflow-hidden">
                <div className="product-image relative aspect-square overflow-hidden">
                  <Image src={kit.image} alt={kit.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs text-primary backdrop-blur-sm">{kit.label}</span>
                </div>
              </Link>
              <CardHeader className="gap-2">
                <CardTitle className="text-lg text-card-foreground">{kit.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-primary">{kit.price} <span className="text-sm font-normal text-muted-foreground">грн</span></p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/product/${kit.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">Детальніше</Button>
                </Link>
                <Button onClick={() => handleAddToCart(kit)} aria-label={`Додати ${kit.name} до кошика`}>Додати</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

// The catalog uses generated local product photography so cards remain useful offline and in preview.
