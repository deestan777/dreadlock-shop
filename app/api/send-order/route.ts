import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { items, totalPrice, customerName, customerPhone, customerEmail, area, postOffice, comment } =
      await req.json()

    const botToken = "7646687769:AAFn1bs9PPdT1WtpNItDBZrvOHyyuFGaSF8"
    const chatId = "-1001668950606"

    const message = `
Нове замовлення!

Товари: ${items}
Загальна сума: ${totalPrice} грн

Інформація про клієнта:
Ім'я: ${customerName}
Телефон: ${customerPhone}
Email: ${customerEmail}
Область: ${area}
Відділення/Поштомат: ${postOffice}

Коментар: ${comment || "Немає"}
    `

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
      throw new Error("Failed to send message to Telegram")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending message to Telegram:", error)
    return NextResponse.json({ error: "Failed to send order" }, { status: 500 })
  }
}

