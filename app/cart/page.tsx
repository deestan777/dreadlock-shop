"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Кошик</h1>
      {items.length === 0 ? (
        <p>Ваш кошик порожній.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.price} грн</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                    className="w-20"
                  />
                  <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold">Загальна сума: {totalPrice} грн</p>
            <div className="space-x-4">
              <Button variant="outline" onClick={clearCart}>
                Очистити кошик
              </Button>
              <Link href="/checkout">
                <Button>Оформити замовлення</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

