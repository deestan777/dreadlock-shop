import { NextResponse } from "next/server"
import { bot } from "@/telegram-bot"

// Обробка вебхуків від Telegram
export async function POST(req: Request) {
  try {
    const update = await req.json()

    // Обробка оновлення
    await bot.handleUpdate(update)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Помилка обробки вебхука Telegram:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Налаштування вебхука
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    // Перевірка токена для безпеки
    if (token !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Отримання URL для вебхука
    const webhookUrl = url.searchParams.get("url")

    if (!webhookUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Встановлення вебхука
    await bot.telegram.setWebhook(webhookUrl)

    return NextResponse.json({ ok: true, message: "Webhook set successfully" })
  } catch (error) {
    console.error("Помилка налаштування вебхука:", error)
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 })
  }
}
