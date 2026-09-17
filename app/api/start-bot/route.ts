import { NextResponse } from "next/server"
import { startBot } from "@/telegram-bot"

// Запуск бота при старті додатку
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    // Перевірка токена для безпеки
    if (token !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Запуск бота
    await startBot()

    return NextResponse.json({ ok: true, message: "Bot started successfully" })
  } catch (error) {
    console.error("Помилка запуску бота:", error)
    return NextResponse.json({ error: "Failed to start bot" }, { status: 500 })
  }
}
