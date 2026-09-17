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
import { GooglePayButton } from "@/components/google-pay-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "google-pay">("cod")
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
      console.error("Error fetching areas:", error)
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
      console.error("Error fetching cities:", error)
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
      console.error("Error fetching post offices:", error)
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
      paymentMethod,
    }

    try {
      console.log("Sending order data:", orderData)
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error:", errorData)
        throw new Error(`API error: ${JSON.stringify(errorData)}`)
      }

      toast({
        title: "Замовлення відправлено",
        description: "Ми зв'яжемося з вами найближчим часом для підтвердження.",
      })
      clearCart()
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося відправити замовлення. Спробуйте ще раз.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGooglePaySuccess = async (paymentData: any) => {
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
      paymentMethod: "google-pay",
    }

    try {
      console.log("Processing Google Pay payment:", { paymentData, orderData })
      const response = await fetch("/api/process-google-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentData, orderData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error:", errorData)
        throw new Error(`API error: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      toast({
        title: "Оплату успішно здійснено",
        description: `Ваше замовлення №${data.orderId} прийнято до обробки.`,
      })
      clearCart()
    } catch (error) {
      console.error("Error processing Google Pay payment:", error)
      toast({
        title: "Помилка оплати",
        description: "Не вдалося обробити платіж. Спробуйте ще раз або виберіть інший спосіб оплати.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGooglePayError = (error: Error) => {
    console.error("Google Pay error:", error)
    toast({
      title: "Помилка Google Pay",
      description: "Виникла проблема з обробкою платежу. Спробуйте інший спосіб оплати.",
      variant: "destructive",
    })
  }

  const isFormValid = name && phone && email && selectedArea && selectedCity && selectedPostOffice

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

        <div className="mt-6">
          <Label className="text-lg font-semibold">Спосіб оплати</Label>
          <Tabs defaultValue="cod" onValueChange={(value) => setPaymentMethod(value as "cod" | "google-pay")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cod">Накладений платіж</TabsTrigger>
              <TabsTrigger value="google-pay">Google Pay</TabsTrigger>
            </TabsList>
            <TabsContent value="cod" className="mt-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p>Оплата при отриманні у відділенні Нової Пошти.</p>
                <Button type="submit" className="w-full mt-4" disabled={isSubmitting || !isFormValid}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Відправка...
                    </>
                  ) : (
                    "Оформити замовлення"
                  )}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="google-pay" className="mt-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p>Оплатіть зараз за допомогою Google Pay.</p>
                {isFormValid ? (
                  <GooglePayButton
                    amount={totalPrice}
                    onPaymentSuccess={handleGooglePaySuccess}
                    onPaymentError={handleGooglePayError}
                  />
                ) : (
                  <Button disabled className="w-full mt-4">
                    Заповніть всі поля форми
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </form>
      <Toaster />
    </div>
  )
}
