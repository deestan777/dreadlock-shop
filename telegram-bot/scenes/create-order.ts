import { Scenes } from "telegraf"
import { message } from "telegraf/filters"

// Створення сцени для створення замовлення
export const createOrderScene = new Scenes.BaseScene<any>("create-order")

// Вхід у сцену
createOrderScene.enter(async (ctx) => {
  await ctx.reply(
    "Створення нового замовлення\n\n" + "Для початку, перегляньте наш каталог товарів і додайте товари до кошика.",
    {
      reply_markup: {
        keyboard: [[{ text: "🛍 Каталог товарів" }], [{ text: "🔙 Повернутися до головного меню" }]],
        resize_keyboard: true,
      },
    },
  )
})

// Обробка текстових повідомлень
createOrderScene.on(message("text"), async (ctx) => {
  if (ctx.message.text === "🛍 Каталог товарів") {
    await ctx.scene.leave()
    await ctx.scene.enter("products")
  } else if (ctx.message.text === "🔙 Повернутися до головного меню") {
    await ctx.scene.leave()
    await ctx.reply("Головне меню:", {
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
  }
})
