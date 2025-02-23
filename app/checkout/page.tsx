"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"
import { getAreas, getCities, searchPostOffices, type Area, type City, type PostOffice } from "@/lib/nova-poshta"
import { PostOfficeSelector } from "@/components/post-office-selector"

export default function CheckoutPage() {
  const [isClient, setIsClient] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedArea, setSelectedArea] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState("")
  const [postOffices, setPostOffices] = useState<PostOffice[]>([])
  const [selectedPostOffice, setSelectedPostOffice] = useState<PostOffice | null>(null)
  const [comment, setComment] = useState("")
  const [isLoadingAreas, setIsLoadingAreas] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingOffices, setIsLoadingOffices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
    fetchAreas()
  }, [])

  useEffect(() => {
    if (selectedArea) {
      fetchCities(selectedArea)
      setSelectedCity("")
      setSelectedPostOffice(null)
    }
  }, [selectedArea])

  useEffect(() => {
    if (selectedCity) {
      fetchPostOffices(selectedCity)
      setSelectedPostOffice(null)
    }
  }, [selectedCity])

  const fetchAreas = async () => {
    setIsLoadingAreas(true)
    try {
      const areasList = await getAreas()
      setAreas(areasList)
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити список областей. Спробуйте оновити сторінку.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAreas(false)
    }
  }

  const fetchCities = async (areaRef: string) => {
    setIsLoadingCities(true)
    try {
      const citiesList = await getCities(areaRef)
      setCities(citiesList)
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити список населених пунктів. Спробуйте ще раз.",
        variant: "destructive",
      })
      setCities([])
    } finally {
      setIsLoadingCities(false)
    }
  }

  const fetchPostOffices = async (cityRef: string) => {
    setIsLoadingOffices(true)
    try {
      const offices = await searchPostOffices(cityRef)
      setPostOffices(offices)
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити список відділень. Спробуйте ще раз.",
        variant: "destructive",
      })
      setPostOffices([])
    } finally {
      setIsLoadingOffices(false)
    }
  }

  if (!isClient) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const selectedAreaName = areas.find((area) => area.Ref === selectedArea)?.Description
    const selectedCityName = cities.find((city) => city.Ref === selectedCity)?.Description

    const orderData = {
      items: items.map((item) => `${item.name} (${item.quantity})`).join(", "),
      totalPrice,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      area: selectedAreaName,
      city: selectedCityName,
      postOffice: selectedPostOffice?.Description,
      comment,
    }

    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        toast({
          title: "Замовлення відправлено",
          description: "Ми зв'яжемося з вами найближчим часом для підтвердження.",
        })
        clearCart()
      } else {
        throw new Error("Failed to send order")
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося відправити замовлення. Спробуйте ще раз.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Оформлення замовлення</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Ім'я</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="area">Область</Label>
          <select
            id="area"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
            disabled={isLoadingAreas}
          >
            <option value="">{isLoadingAreas ? "Завантаження областей..." : "Оберіть область"}</option>
            {areas.map((area) => (
              <option key={area.Ref} value={area.Ref}>
                {area.Description}
              </option>
            ))}
          </select>
          {isLoadingAreas && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Завантаження областей...</span>
            </div>
          )}
        </div>
        {selectedArea && (
          <div>
            <Label htmlFor="city">Населений пункт</Label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              disabled={isLoadingCities}
            >
              <option value="">
                {isLoadingCities ? "Завантаження населених пунктів..." : "Оберіть населений пункт"}
              </option>
              {cities.map((city) => (
                <option key={city.Ref} value={city.Ref}>
                  {city.Description}
                </option>
              ))}
            </select>
            {isLoadingCities && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Завантаження населених пунктів...</span>
              </div>
            )}
          </div>
        )}
        {selectedCity && (
          <div>
            <Label htmlFor="postOffice">Відділення або поштомат</Label>
            <PostOfficeSelector
              postOffices={postOffices}
              onSelect={setSelectedPostOffice}
              isLoading={isLoadingOffices}
            />
            {selectedPostOffice && (
              <div className="mt-2 p-2 bg-gray-100 rounded-md">
                <p className="font-semibold">Обране відділення:</p>
                <p>{selectedPostOffice.Description}</p>
              </div>
            )}
          </div>
        )}
        <div>
          <Label htmlFor="comment">Коментар до замовлення</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Додаткова інформація до замовлення..."
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Ваше замовлення:</h2>
          <ul className="list-disc list-inside">
            {items.map((item) => (
              <li key={item.id}>
                {item.name} - {item.quantity} шт. ({item.price * item.quantity} грн)
              </li>
            ))}
          </ul>
          <p className="font-bold mt-2">Загальна сума: {totalPrice} грн</p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoadingAreas || isLoadingCities || isLoadingOffices || !selectedPostOffice}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Відправка...
            </>
          ) : (
            "Оформити замовлення"
          )}
        </Button>
      </form>
      <div id="google-pay-button"></div>
      <Toaster />
    </div>
  )
}

