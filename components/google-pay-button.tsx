"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface GooglePayButtonProps {
  amount: number
  onPaymentSuccess: (paymentData: any) => void
  onPaymentError: (error: Error) => void
}

declare global {
  interface Window {
    google?: {
      payments?: {
        api?: {
          PaymentsClient: new (
            options: any,
          ) => {
            isReadyToPay: (request: any) => Promise<{ result: boolean }>
            loadPaymentData: (request: any) => Promise<any>
          }
        }
      }
    }
  }
}

export function GooglePayButton({ amount, onPaymentSuccess, onPaymentError }: GooglePayButtonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false)
  const googlePayClientRef = useRef<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Завантаження Google Pay API
    const script = document.createElement("script")
    script.src = "https://pay.google.com/gp/p/js/pay.js"
    script.async = true
    script.onload = initGooglePay
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const initGooglePay = async () => {
    try {
      if (!window.google || !window.google.payments || !window.google.payments.api) {
        console.error("Google Pay API not available")
        setIsGooglePayAvailable(false)
        setIsLoading(false)
        return
      }

      const googlePayClient = new window.google.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
      })
      googlePayClientRef.current = googlePayClient

      // Перевірка доступності Google Pay
      const isReadyToPay = await googlePayClient.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["MASTERCARD", "VISA"],
            },
          },
        ],
      })

      setIsGooglePayAvailable(isReadyToPay.result === true)
      setIsLoading(false)
    } catch (error) {
      console.error("Google Pay initialization error:", error)
      setIsGooglePayAvailable(false)
      setIsLoading(false)
    }
  }

  const handleGooglePayClick = async () => {
    if (!googlePayClientRef.current) return

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["MASTERCARD", "VISA"],
            },
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              parameters: {
                gateway: "stripe",
                "stripe:version": "2020-08-27",
                "stripe:publishableKey": process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
              },
            },
          },
        ],
        merchantInfo: {
          merchantId: "BCR2DN6TV7FGBGTE", // Замініть на ваш merchant ID в продакшені
          merchantName: "Dreadlock Kits Shop",
        },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: "UAH",
        },
      }

      const paymentData = await googlePayClientRef.current.loadPaymentData(paymentDataRequest)
      onPaymentSuccess(paymentData)
    } catch (error) {
      console.error("Google Pay payment error:", error)
      if (error !== "CANCELED") {
        toast({
          title: "Помилка оплати",
          description: "Не вдалося обробити платіж через Google Pay. Спробуйте інший спосіб оплати.",
          variant: "destructive",
        })
        onPaymentError(error as Error)
      }
    }
  }

  if (isLoading) {
    return (
      <Button disabled className="w-full mt-4 bg-white border border-gray-300 shadow-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Завантаження Google Pay...
      </Button>
    )
  }

  if (!isGooglePayAvailable) {
    return null
  }

  return (
    <Button
      onClick={handleGooglePayClick}
      className="w-full mt-4 bg-white border border-gray-300 shadow-sm hover:bg-gray-50"
    >
      <div className="flex items-center justify-center">
        <svg width="80" height="40" viewBox="0 0 80 40">
          <path
            d="M35.8 19.5c0-1.3-.1-2.5-.4-3.7h-15v7h8.6c-.4 2-1.5 3.8-3.3 4.9v4h5.3c3.1-2.9 4.8-7.1 4.8-12.2z"
            fill="#4285F4"
          />
          <path
            d="M20.4 36c4.4 0 8.2-1.5 10.9-4.1l-5.3-4c-1.5 1-3.4 1.6-5.5 1.6-4.2 0-7.8-2.8-9.1-6.7H6v4.1c2.7 5.4 8.3 9.1 14.4 9.1z"
            fill="#34A853"
          />
          <path
            d="M11.3 22.8c-.3-1-.5-2-.5-3.1s.2-2.1.5-3.1v-4.1H6c-1.3 2.6-2 5.5-2 8.5s.7 5.9 2 8.5l5.3-4.1c0-.1 0-.1 0-.1z"
            fill="#FBBC05"
          />
          <path
            d="M20.4 13c2.4 0 4.5.8 6.2 2.4l4.7-4.7C28.4 8 24.7 6.5 20.4 6.5c-6.1 0-11.7 3.7-14.4 9.1l5.3 4.1c1.3-3.9 4.9-6.7 9.1-6.7z"
            fill="#EA4335"
          />
        </svg>
      </div>
    </Button>
  )
}
