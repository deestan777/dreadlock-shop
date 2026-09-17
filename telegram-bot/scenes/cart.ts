import { Scenes } from "telegraf"
import { message } from "telegraf/filters"

// Створення сцени для кошика
export const cartScene = new Scenes.BaseScene<any>("cart")

// Вхід у сцену
cartScene.enter(async (ctx) => {
  if (!ctx.session.cart || ctx.session.cart.length === 0) {
    await ctx.reply("Ваш кошик порожній.", {
      reply_markup: {
        keyboard: [[{ text: "🛍 Каталог товарів" }], [{ text: "📦 Оформити замовлення" }], [{ text: "❓ Допомога" }]],
        resize_keyboard: true,
      },
    })
    return
  }

  // Розрахунок загальної суми
  const totalPrice = ctx.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  await ctx.reply(
    "Ваш кошик:\n\n" +
      ctx.session.cart
        .map(
          (item, index) =>
            `${index + 1}. ${item.name}${item.color ? ` (${item.color})` : ""} - ${item.quantity} шт. - ${item.price * item.quantity} грн`,
        )
        .join("\n") +
      `\n\nЗагальна сума: ${totalPrice} грн`,
    {
      reply_markup: {
        inline_keyboard: [
          ...ctx.session.cart.map((_, index) => [
            { text: `❌ Видалити товар #${index + 1}`, callback_data: `remove_item:${index}` },
          ]),
          [{ text: "🗑 Очистити кошик", callback_data: "clear_cart" }],
          [{ text: "📦 Оформити замовлення", callback_data: "checkout" }],
          [{ text: "🔙 Повернутися до головного меню", callback_data: "back_to_main" }],
        ],
      },
    },
  )
})

// Видалення товару з кошика
cartScene.action(/remove_item:(\d+)/, async (ctx) => {
  const index = Number.parseInt(ctx.match[1])

  if (ctx.session.cart && ctx.session.cart.length > index) {
    const removedItem = ctx.session.cart[index]
    ctx.session.cart.splice(index, 1)

    await ctx.answerCbQuery(`${removedItem.name} видалено з кошика`)

    // Оновлюємо повідомлення з кошиком
    await ctx.scene.reenter()
  }
})

// Очищення кошика
cartScene.action("clear_cart", async (ctx) => {
  ctx.session.cart = []
  await ctx.answerCbQuery("Кошик очищено")
  await ctx.reply("Ваш кошик порожній.")
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
})

// Перехід до оформлення замовлення
cartScene.action("checkout", async (ctx) => {
  if (ctx.session.cart && ctx.session.cart.length > 0) {
    await ctx.answerCbQuery("Перехід до оформлення замовлення")
    await ctx.scene.leave()
    await ctx.scene.enter("checkout")
  } else {
    await ctx.answerCbQuery("Ваш кошик порожній")
  }
})

// Повернення до головного меню
cartScene.action("back_to_main", async (ctx) => {
  await ctx.answerCbQuery("Повернення до головного меню")
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
})

// Обробка текстових повідомлень
cartScene.on(message("text"), async (ctx) => {
  if (ctx.message.text === "🛍 Каталог товарів") {
    await ctx.scene.leave()
    await ctx.scene.enter("products")
  } else if (ctx.message.text === "📦 Оформити замовлення") {
    if (ctx.session.cart && ctx.session.cart.length > 0) {
      await ctx.scene.leave()
      await ctx.scene.enter("checkout")
    } else {
      await ctx.reply("Ваш кошик порожній. Спочатку додайте товари до кошика.")
    }
  } else if (ctx.message.text === "❓ Допомога") {
    await ctx.reply(
      "Як користуватися ботом:\n\n" +
        "1. Перегляньте каталог товарів і додайте товари до кошика\n" +
        "2. Перейдіть до кошика, щоб переглянути вибрані товари\n" +
        "3. Оформіть замовлення, вказавши контактні дані та адресу доставки\n\n" +
        "Якщо у вас виникли питання, зв'яжіться з нами за телефоном +380XXXXXXXXX",
    )
  }
})
