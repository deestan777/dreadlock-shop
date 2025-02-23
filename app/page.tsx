"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"

const kits = [
  { id: 1, name: "Початковий комплект", price: 999, image: "/placeholder.svg?height=200&width=200" },
  { id: 2, name: "Професійний комплект", price: 1499, image: "/placeholder.svg?height=200&width=200" },
  { id: 3, name: "Преміум комплект", price: 1999, image: "/placeholder.svg?height=200&width=200" },
  { id: 4, name: "Комплект для догляду", price: 799, image: "/placeholder.svg?height=200&width=200" },
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Ласкаво просимо до магазину комплектів для дредів</h1>
      <p className="text-center text-lg">Оберіть готовий комплект або перегляньте окремі товари</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kits.map((kit) => (
          <Card key={kit.id}>
            <CardHeader>
              <CardTitle>{kit.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={kit.image || "/placeholder.svg"}
                alt={kit.name}
                width={200}
                height={200}
                className="w-full h-48 object-cover mb-4 rounded-md"
              />
              <p className="text-2xl font-bold">{kit.price} грн</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/product/${kit.id}`}>
                <Button variant="outline">Детальніше</Button>
              </Link>
              <Button onClick={() => handleAddToCart(kit)}>Додати в кошик</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

