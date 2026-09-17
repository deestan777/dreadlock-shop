"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

// Це приклад даних. У реальному додатку ви б отримували ці дані з API або бази даних.
const products = [
  {
    id: 1,
    name: "Початковий комплект",
    price: 999,
    description: "Ідеальний комплект для початківців, які хочуть спробувати створити дреди.",
    longDescription:
      "Цей комплект містить все необхідне для створення ваших перших дредів. Він включає спеціальний гребінець для формування дредів, віск для фіксації, та інструкцію з докладними кроками створення дредів.",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    colors: ["Натуральний", "Чорний", "Коричневий"],
    features: [
      "Спеціальний гребінець для формування дредів",
      "Віск для фіксації дредів",
      "Докладна інструкція",
      "Еластичні резинки для фіксації",
    ],
  },
  {
    id: 2,
    name: "Професійний комплект",
    price: 1499,
    description: "Розширений комплект для створення професійних дредів.",
    longDescription:
      "Професійний комплект містить все необхідне для створення довговічних та стильних дредів. Включає професійні інструменти та високоякісні матеріали для найкращого результату.",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    colors: ["Натуральний", "Чорний", "Коричневий", "Блонд"],
    features: [
      "Професійний гребінець для формування дредів",
      "Високоякісний віск для фіксації",
      "Спеціальний шампунь для дредів",
      "Набір гачків для обслуговування дредів",
    ],
  },
  {
    id: 3,
    name: "Преміум комплект",
    price: 1999,
    description: "Повний комплект для створення та догляду за дредами преміум якості.",
    longDescription:
      "Преміум комплект - це все, що вам потрібно для створення, обслуговування та стилізації ваших дредів. Включає найкращі інструменти та продукти для догляду за вашою зачіскою.",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    colors: ["Натуральний", "Чорний", "Коричневий", "Блонд", "Рудий"],
    features: [
      "Повний набір професійних інструментів",
      "Преміум віск та шампунь для дредів",
      "Набір для фарбування дредів",
      "Аксесуари для стилізації",
    ],
  },
  {
    id: 4,
    name: "Комплект для догляду",
    price: 799,
    description: "Все необхідне для підтримки здоров'я та вигляду ваших дредів.",
    longDescription:
      "Цей комплект ідеально підходить для тих, хто вже має дреди і хоче підтримувати їх у відмінному стані. Включає спеціальні засоби для догляду та інструменти для обслуговування.",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    colors: ["Універсальний"],
    features: [
      "Спеціальний шампунь для дредів",
      "Кондиціонер для дредів",
      "Спрей для зволоження",
      "Інструменти для обслуговування",
    ],
  },
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === Number.parseInt(params.id))
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addItem } = useCart()
  const { toast } = useToast()

  if (!product) {
    return <div>Товар не знайдено</div>
  }

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, quantity: 1, color: selectedColor })
    toast({
      title: "Товар додано до кошика",
      description: `${product.name} (${selectedColor}) успішно додано до вашого кошика.`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.images[currentImageIndex] || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <div className="flex justify-center mt-4 space-x-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-16 rounded-md overflow-hidden ${
                  index === currentImageIndex ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <Image src={img || "/placeholder.svg"} alt={`${product.name} ${index + 1}`} width={64} height={64} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl font-semibold mb-4">{product.price} грн</p>
          <p className="mb-4">{product.description}</p>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Оберіть колір:</h2>
            <div className="flex space-x-2">
              {product.colors.map((color) => (
                <Button
                  key={color}
                  variant={selectedColor === color ? "default" : "outline"}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={handleAddToCart} className="w-full">
            Додати в кошик
          </Button>
        </div>
      </div>
      <Tabs defaultValue="description" className="mt-8">
        <TabsList>
          <TabsTrigger value="description">Опис</TabsTrigger>
          <TabsTrigger value="features">Характеристики</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          <Card>
            <CardContent className="pt-6">
              <p>{product.longDescription}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="features">
          <Card>
            <CardContent className="pt-6">
              <ul className="list-disc pl-5">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
