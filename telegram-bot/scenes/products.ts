import { Scenes } from "telegraf"
import { message } from "telegraf/filters"

// Приклад даних товарів (такі ж, як у веб-додатку)
const products = [
  {
    id: 1,
    name: "Початковий комплект",
    price: 999,
    description: "Ідеальний комплект для початківців, які хочуть спробувати створити дреди.",
    colors: ["Натуральний", "Чорний", "Коричневий"],
  },
  {
    id: 2,
    name: "Професійний комплект",
    price: 1499,
    description: "Розширений комплект для створення професійних дредів.",
    colors: ["Натуральний", "Чорний", "Коричневий", "Блонд"],
  },
  {
    id: 3,
    name: "Преміум комплект",
    price: 1999,
    description: "Повний комплект для створення та догляду за дредами преміум якості.",
    colors: ["Натуральний", "Чорний", "Коричневий", "Блонд", "Рудий"],
  },
  {
    id: 4,
    name: "Комплект для догляду",
    price: 799,
    description: "Все необхідне для підтримки здоров'я та вигляду ваших дредів.",
    colors: ["Універсальний"],
  },
]

// Створення сцени для перегляду товарів
export const productsScene = new Scenes.BaseScene<any>("products")

// Вхід у сцену
productsScene.enter(async (ctx) => {
  await ctx.reply(
    "Каталог товарів:\n\n" +
      products
        .map((product, index) => `${index + 1}. ${product.name} - ${product.price} грн\n${product.description}`)
        .join("\n\n"),
    {
      reply_markup: {
        inline_keyboard: [
          ...products.map((product) => [
            { text: `Додати "${product.name}" до кошика`, callback_data: `add_to_cart:${product.id}` },
          ]),
          [{ text: "Повернутися до головного меню", callback_data: "back_to_main" }],
        ],
      },
    },
  )
})

// Обробка вибору кольору
productsScene.action(/select_color:(\d+):(.+)/, async (ctx) => {
  const productId = Number.parseInt(ctx.match[1])
  const color = ctx.match[2]
  const product = products.find((p) => p.id === productId)

  if (product) {
    // Додаємо товар до кошика з вибраним кольором
    if (!ctx.session.cart) {
      ctx.session.cart = []
    }

    const existingItemIndex = ctx.session.cart.findIndex((item) => item.id === productId && item.color === color)

    if (existingItemIndex >= 0) {
      ctx.session.cart[existingItemIndex].quantity += 1
    } else {
      ctx.session.cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        color: color,
      })
    }

    await ctx.answerCbQuery(`${product.name} (${color}) додано до кошика!`)
    await ctx.reply(`${product.name} (${color}) додано до кошика!`)
  }
})

// Обробка додавання товару до кошика
productsScene.action(/add_to_cart:(\d+)/, async (ctx) => {
  const productId = Number.parseInt(ctx.match[1])
  const product = products.find((p) => p.id === productId)

  if (product) {
    if (product.colors.length > 1) {
      // Якщо є кілька кольорів, пропонуємо вибрати
      await ctx.reply(`Оберіть колір для "${product.name}":`, {
        reply_markup: {
          inline_keyboard: [
            ...product.colors.map((color) => [{ text: color, callback_data: `select_color:${productId}:${color}` }]),
            [{ text: "Скасувати", callback_data: "cancel_color_selection" }],
          ],
        },
      })
    } else {
      // Якщо колір один, додаємо товар одразу
      if (!ctx.session.cart) {
        ctx.session.cart = []
      }

      const color = product.colors[0]
      const existingItemIndex = ctx.session.cart.findIndex((item) => item.id === productId && item.color === color)

      if (existingItemIndex >= 0) {
        ctx.session.cart[existingItemIndex].quantity += 1
      } else {
        ctx.session.cart.push({
          id: productId,
          name: product.name,
          price: product.price,
          quantity: 1,
          color: color,
        })
      }

      await ctx.answerCbQuery(`${product.name} додано до кошика!`)
      await ctx.reply(`${product.name} додано до кошика!`)
    }
  }
})

// Скасування вибору кольору
productsScene.action("cancel_color_selection", async (ctx) => {
  await ctx.answerCbQuery("Вибір кольору скасовано")
  await ctx.deleteMessage()
})

// Повернення до головного меню
productsScene.action("back_to_main", async (ctx) => {
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
productsScene.on(message("text"), async (ctx) => {
  if (ctx.message.text === "🛒 Кошик") {
    await ctx.scene.leave()
    await ctx.scene.enter("cart")
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
