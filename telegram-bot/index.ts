import { Telegraf, Scenes, session } from "telegraf"
import { message } from "telegraf/filters"
import { createOrderScene } from "./scenes/create-order"
import { productsScene } from "./scenes/products"
import { cartScene } from "./scenes/cart"
import { checkoutScene } from "./scenes/checkout"

// Типи для контексту бота
interface BotContext extends Scenes.SceneContext {
  session: {
    cart: Array<{
      id: number
      name: string
      price: number
      quantity: number
      color?: string
    }>
    orderData?: {
      customerName?: string
      customerPhone?: string
      customerEmail?: string
      area?: string
      city?: string
      postOffice?: string
      comment?: string
      paymentMethod?: "cod" | "google-pay"
    }
  }
}

// Ініціалізація бота
const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN || "")

// Налаштування сесії та сцен
const stage = new Scenes.Stage<BotContext>([createOrderScene, productsScene, cartScene, checkoutScene])

bot.use(session())
bot.use(stage.middleware())

// Обробка команди /start
bot.command("start", async (ctx) => {
  // Ініціалізація кошика, якщо він ще не існує
  if (!ctx.session.cart) {
    ctx.session.cart = []
  }

  await ctx.reply("Ласкаво просимо до магазину комплектів для дредів!\n\n" + "Оберіть дію:", {
    reply_markup: {
      keyboard: [
        [{ text: "🛍 Каталог товарів" }],
        [{ text: "🛒 Кошик" }],
        [{ text: "📦 Оформити замовлення" }],
        [{ text: "❓ Допомога" }],
      ],
      resize_keyboard: true,
    },
  })
})

// Обробка текстових повідомлень для навігації
bot.on(message("text"), async (ctx) => {
  const text = ctx.message.text

  if (text === "🛍 Каталог товарів") {
    await ctx.scene.enter("products")
  } else if (text === "🛒 Кошик") {
    await ctx.scene.enter("cart")
  } else if (text === "📦 Оформити замовлення") {
    if (ctx.session.cart && ctx.session.cart.length > 0) {
      await ctx.scene.enter("checkout")
    } else {
      await ctx.reply("Ваш кошик порожній. Спочатку додайте товари до кошика.")
    }
  } else if (text === "❓ Допомога") {
    await ctx.reply(
      "Як користуватися ботом:\n\n" +
        "1. Перегляньте каталог товарів і додайте товари до кошика\n" +
        "2. Перейдіть до кошика, щоб переглянути вибрані товари\n" +
        "3. Оформіть замовлення, вказавши контактні дані та адресу доставки\n\n" +
        "Якщо у вас виникли питання, зв'яжіться з нами за телефоном +380XXXXXXXXX",
    )
  }
})

// Обробка помилок
bot.catch((err, ctx) => {
  console.error(`Помилка для ${ctx.updateType}`, err)
  ctx.reply("Сталася помилка. Спробуйте ще раз або зв'яжіться з адміністратором.")
})

// Запуск бота
export async function startBot() {
  try {
    await bot.launch()
    console.log("Бот успішно запущено")

    // Коректне завершення роботи
    process.once("SIGINT", () => bot.stop("SIGINT"))
    process.once("SIGTERM", () => bot.stop("SIGTERM"))

    return bot
  } catch (error) {
    console.error("Помилка запуску бота:", error)
    throw error
  }
}

// Експорт бота для використання в інших частинах додатку
export { bot }
