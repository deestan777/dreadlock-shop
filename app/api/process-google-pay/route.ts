import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { paymentData, orderData } = await req.json()

    // Тут ви б обробили платіжні дані через Stripe або іншу платіжну систему
    // Для прикладу, ми просто імітуємо успішну обробку

    // Відправка даних замовлення в Telegram (використовуємо існуючу логіку)
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      console.error("Missing Telegram credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const message = `
Нове замовлення (оплачено через Google Pay)!

Товари: ${orderData.items}
Загальна сума: ${orderData.totalPrice} грн

Інформація про клієнта:
Ім'я: ${orderData.customerName}
Телефон: ${orderData.customerPhone}
Email: ${orderData.customerEmail}
Область: ${orderData.area || "Не вказано"}
Місто: ${orderData.city || "Не вказано"}
Відділення/Поштомат: ${orderData.postOffice || "Не вказано"}

Коментар: ${orderData.comment || "Немає"}
    `

    console.log("Sending message to Telegram:", { botToken, chatId })

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Telegram API error:", errorData)
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`)
    }

    return NextResponse.json({ success: true, orderId: `ORD-${Date.now()}` })
  } catch (error) {
    console.error("Error processing Google Pay payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
