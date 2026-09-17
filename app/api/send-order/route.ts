import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { items, totalPrice, customerName, customerPhone, customerEmail, area, city, postOffice, comment } =
      await req.json()

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      console.error("Missing Telegram credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const message = `
Нове замовлення!

Товари: ${items}
Загальна сума: ${totalPrice} грн

Інформація про клієнта:
Ім'я: ${customerName}
Телефон: ${customerPhone}
Email: ${customerEmail}
Область: ${area || "Не вказано"}
Місто: ${city || "Не вказано"}
Відділення/Поштомат: ${postOffice || "Не вказано"}

Коментар: ${comment || "Немає"}
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending message to Telegram:", error)
    return NextResponse.json({ error: "Failed to send order" }, { status: 500 })
  }
}
