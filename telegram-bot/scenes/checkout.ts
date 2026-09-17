import { Scenes } from "telegraf"
import { message } from "telegraf/filters"
import { getAreas, getCities, searchPostOffices } from "@/lib/nova-poshta"

// Створення сцени для оформлення замовлення
export const checkoutScene = new Scenes.WizardScene<any>(
  "checkout",
  // Крок 1: Запит імені
  async (ctx) => {
    // Ініціалізація даних замовлення
    ctx.session.orderData = {}

    await ctx.reply("Оформлення замовлення\n\n" + "Крок 1/5: Введіть ваше ім'я:", {
      reply_markup: {
        keyboard: [[{ text: "🔙 Скасувати оформлення" }]],
        resize_keyboard: true,
      },
    })

    return ctx.wizard.next()
  },
  // Крок 2: Запит телефону
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      if (ctx.message.text === "🔙 Скасувати оформлення") {
        await ctx.reply("Оформлення замовлення скасовано")
        return ctx.scene.leave()
      }

      ctx.session.orderData.customerName = ctx.message.text

      await ctx.reply("Крок 2/5: Введіть ваш номер телефону:", {
        reply_markup: {
          keyboard: [[{ text: "🔙 Скасувати оформлення" }]],
          resize_keyboard: true,
        },
      })

      return ctx.wizard.next()
    }
  },
  // Крок 3: Запит email
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      if (ctx.message.text === "🔙 Скасувати оформлення") {
        await ctx.reply("Оформлення замовлення скасовано")
        return ctx.scene.leave()
      }

      ctx.session.orderData.customerPhone = ctx.message.text

      await ctx.reply("Крок 3/5: Введіть ваш email:", {
        reply_markup: {
          keyboard: [[{ text: "🔙 Скасувати оформлення" }]],
          resize_keyboard: true,
        },
      })

      return ctx.wizard.next()
    }
  },
  // Крок 4: Вибір області
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      if (ctx.message.text === "🔙 Скасувати оформлення") {
        await ctx.reply("Оформлення замовлення скасовано")
        return ctx.scene.leave()
      }

      ctx.session.orderData.customerEmail = ctx.message.text

      // Отримання списку областей
      await ctx.reply("Завантаження списку областей...")

      try {
        const areas = await getAreas()

        // Зберігаємо області в сесії для подальшого використання
        ctx.session.areas = areas

        await ctx.reply("Крок 4/5: Оберіть область:", {
          reply_markup: {
            inline_keyboard: [
              ...areas.map((area) => [{ text: area.Description, callback_data: `select_area:${area.Ref}` }]),
              [{ text: "🔙 Скасувати оформлення", callback_data: "cancel_checkout" }],
            ],
          },
        })

        return ctx.wizard.next()
      } catch (error) {
        console.error("Помилка отримання областей:", error)
        await ctx.reply("Не вдалося завантажити список областей. Спробуйте ще раз або зв'яжіться з адміністратором.", {
          reply_markup: {
            keyboard: [[{ text: "🔙 Скасувати оформлення" }], [{ text: "🔄 Спробувати ще раз" }]],
            resize_keyboard: true,
          },
        })
      }
    }
  },
  // Крок 5: Вибір міста та відділення
  async (ctx) => {
    // Цей крок обробляє callback-запити для вибору області, міста та відділення
    return ctx.wizard.next()
  },
  // Крок 6: Підтвердження замовлення
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      if (ctx.message.text === "🔙 Скасувати оформлення") {
        await ctx.reply("Оформлення замовлення скасовано")
        return ctx.scene.leave()
      }

      // Додаємо коментар до замовлення
      ctx.session.orderData.comment = ctx.message.text

      // Розрахунок загальної суми
      const totalPrice = ctx.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // Формування повідомлення з деталями замовлення
      const orderDetails =
        "Деталі вашого замовлення:\n\n" +
        ctx.session.cart
          .map(
            (item, index) =>
              `${index + 1}. ${item.name}${item.color ? ` (${item.color})` : ""} - ${item.quantity} шт. - ${item.price * item.quantity} грн`,
          )
          .join("\n") +
        `\n\nЗагальна сума: ${totalPrice} грн\n\n` +
        "Контактна інформація:\n" +
        `Ім'я: ${ctx.session.orderData.customerName}\n` +
        `Телефон: ${ctx.session.orderData.customerPhone}\n` +
        `Email: ${ctx.session.orderData.customerEmail}\n\n` +
        "Адреса доставки:\n" +
        `Область: ${ctx.session.orderData.area}\n` +
        `Місто: ${ctx.session.orderData.city}\n` +
        `Відділення: ${ctx.session.orderData.postOffice}\n\n` +
        `Коментар: ${ctx.session.orderData.comment || "Немає"}`

      await ctx.reply(orderDetails, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Підтвердити замовлення", callback_data: "confirm_order" }],
            [{ text: "🔙 Скасувати замовлення", callback_data: "cancel_checkout" }],
          ],
        },
      })
    }
  },
)

// Обробка вибору області
checkoutScene.action(/select_area:(.+)/, async (ctx) => {
  const areaRef = ctx.match[1]

  // Знаходимо назву області
  const area = ctx.session.areas.find((a) => a.Ref === areaRef)
  if (area) {
    ctx.session.orderData.area = area.Description

    // Отримання списку міст
    await ctx.answerCbQuery(`Обрано область: ${area.Description}`)
    await ctx.reply(`Завантаження міст для області ${area.Description}...`)

    try {
      const cities = await getCities(areaRef)

      // Зберігаємо міста в сесії для подальшого використання
      ctx.session.cities = cities

      // Розбиваємо список міст на частини, щоб не перевищити ліміт Telegram
      const cityChunks = []
      for (let i = 0; i < cities.length; i += 10) {
        cityChunks.push(cities.slice(i, i + 10))
      }

      for (let i = 0; i < cityChunks.length; i++) {
        const chunk = cityChunks[i]
        await ctx.reply(i === 0 ? "Оберіть місто:" : `Міста (продовження ${i + 1}/${cityChunks.length}):`, {
          reply_markup: {
            inline_keyboard: [
              ...chunk.map((city) => [{ text: city.Description, callback_data: `select_city:${city.Ref}` }]),
              ...(i === cityChunks.length - 1
                ? [[{ text: "🔙 Назад до вибору області", callback_data: "back_to_areas" }]]
                : []),
            ],
          },
        })
      }
    } catch (error) {
      console.error("Помилка отримання міст:", error)
      await ctx.reply("Не вдалося завантажити список міст. Спробуйте ще раз або зв'яжіться з адміністратором.", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Спробувати ще раз", callback_data: `select_area:${areaRef}` }],
            [{ text: "🔙 Назад до вибору області", callback_data: "back_to_areas" }],
          ],
        },
      })
    }
  }
})

// Повернення до вибору області
checkoutScene.action("back_to_areas", async (ctx) => {
  await ctx.answerCbQuery("Повернення до вибору області")

  await ctx.reply("Оберіть область:", {
    reply_markup: {
      inline_keyboard: [
        ...ctx.session.areas.map((area) => [{ text: area.Description, callback_data: `select_area:${area.Ref}` }]),
        [{ text: "🔙 Скасувати оформлення", callback_data: "cancel_checkout" }],
      ],
    },
  })
})

// Обробка вибору міста
checkoutScene.action(/select_city:(.+)/, async (ctx) => {
  const cityRef = ctx.match[1]

  // Знаходимо назву міста
  const city = ctx.session.cities.find((c) => c.Ref === cityRef)
  if (city) {
    ctx.session.orderData.city = city.Description

    // Отримання списку відділень
    await ctx.answerCbQuery(`Обрано місто: ${city.Description}`)
    await ctx.reply(`Завантаження відділень для міста ${city.Description}...`)

    try {
      const postOffices = await searchPostOffices(cityRef)

      // Зберігаємо відділення в сесії для подальшого використання
      ctx.session.postOffices = postOffices

      // Розбиваємо список відділень на частини, щоб не перевищити ліміт Telegram
      const officeChunks = []
      for (let i = 0; i < postOffices.length; i += 5) {
        officeChunks.push(postOffices.slice(i, i + 5))
      }

      for (let i = 0; i < officeChunks.length; i++) {
        const chunk = officeChunks[i]
        await ctx.reply(i === 0 ? "Оберіть відділення:" : `Відділення (продовження ${i + 1}/${officeChunks.length}):`, {
          reply_markup: {
            inline_keyboard: [
              ...chunk.map((office) => [{ text: office.Description, callback_data: `select_office:${office.Ref}` }]),
              ...(i === officeChunks.length - 1
                ? [[{ text: "🔙 Назад до вибору міста", callback_data: "back_to_cities" }]]
                : []),
            ],
          },
        })
      }
    } catch (error) {
      console.error("Помилка отримання відділень:", error)
      await ctx.reply("Не вдалося завантажити список відділень. Спробуйте ще раз або зв'яжіться з адміністратором.", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Спробувати ще раз", callback_data: `select_city:${cityRef}` }],
            [{ text: "🔙 Назад до вибору міста", callback_data: "back_to_cities" }],
          ],
        },
      })
    }
  }
})

// Повернення до вибору міста
checkoutScene.action("back_to_cities", async (ctx) => {
  await ctx.answerCbQuery("Повернення до вибору міста")

  // Розбиваємо список міст на частини, щоб не перевищити ліміт Telegram
  const cityChunks = []
  for (let i = 0; i < ctx.session.cities.length; i += 10) {
    cityChunks.push(ctx.session.cities.slice(i, i + 10))
  }

  for (let i = 0; i < cityChunks.length; i++) {
    const chunk = cityChunks[i]
    await ctx.reply(i === 0 ? "Оберіть місто:" : `Міста (продовження ${i + 1}/${cityChunks.length}):`, {
      reply_markup: {
        inline_keyboard: [
          ...chunk.map((city) => [{ text: city.Description, callback_data: `select_city:${city.Ref}` }]),
          ...(i === cityChunks.length - 1
            ? [[{ text: "🔙 Назад до вибору області", callback_data: "back_to_areas" }]]
            : []),
        ],
      },
    })
  }
})

// Обробка вибору відділення
checkoutScene.action(/select_office:(.+)/, async (ctx) => {
  const officeRef = ctx.match[1]

  // Знаходимо назву відділення
  const office = ctx.session.postOffices.find((o) => o.Ref === officeRef)
  if (office) {
    ctx.session.orderData.postOffice = office.Description

    await ctx.answerCbQuery(`Обрано відділення: ${office.Description}`)
    await ctx.reply(
      `Ви обрали відділення: ${office.Description}\n\n` +
        'Крок 5/5: Введіть коментар до замовлення (або натисніть "Пропустити"):',
      {
        reply_markup: {
          keyboard: [[{ text: "Пропустити" }], [{ text: "🔙 Скасувати оформлення" }]],
          resize_keyboard: true,
        },
      },
    )

    // Переходимо до наступного кроку (коментар та підтвердження)
    ctx.wizard.selectStep(5)
  }
})

// Обробка підтвердження замовлення
checkoutScene.action("confirm_order", async (ctx) => {
  await ctx.answerCbQuery("Замовлення підтверджено")

  // Розрахунок загальної суми
  const totalPrice = ctx.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Формування повідомлення для адміністратора
  const adminMessage =
    "Нове замовлення!\n\n" +
    ctx.session.cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}${item.color ? ` (${item.color})` : ""} - ${item.quantity} шт. - ${item.price * item.quantity} грн`,
      )
      .join("\n") +
    `\n\nЗагальна сума: ${totalPrice} грн\n\n` +
    "Контактна інформація:\n" +
    `Ім'я: ${ctx.session.orderData.customerName}\n` +
    `Телефон: ${ctx.session.orderData.customerPhone}\n` +
    `Email: ${ctx.session.orderData.customerEmail}\n\n` +
    "Адреса доставки:\n" +
    `Область: ${ctx.session.orderData.area}\n` +
    `Місто: ${ctx.session.orderData.city}\n` +
    `Відділення: ${ctx.session.orderData.postOffice}\n\n` +
    `Коментар: ${ctx.session.orderData.comment || "Немає"}`

  // Відправка повідомлення адміністратору
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (chatId) {
    try {
      await ctx.telegram.sendMessage(chatId, adminMessage)
    } catch (error) {
      console.error("Помилка відправки повідомлення адміністратору:", error)
    }
  }

  // Очищення кошика
  ctx.session.cart = []

  // Повідомлення користувачу про успішне оформлення
  await ctx.reply(
    "✅ Ваше замовлення успішно оформлено!\n\n" +
      "Ми зв'яжемося з вами найближчим часом для підтвердження деталей.\n\n" +
      "Дякуємо за покупку! 🙏",
    {
      reply_markup: {
        keyboard: [[{ text: "🛍 Каталог товарів" }], [{ text: "🛒 Кошик" }], [{ text: "❓ Допомога" }]],
        resize_keyboard: true,
      },
    },
  )

  return ctx.scene.leave()
})

// Скасування оформлення замовлення
checkoutScene.action("cancel_checkout", async (ctx) => {
  await ctx.answerCbQuery("Оформлення замовлення скасовано")
  await ctx.reply("Оформлення замовлення скасовано.", {
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

  return ctx.scene.leave()
})

// Обробка текстових повідомлень
checkoutScene.on(message("text"), async (ctx) => {
  if (ctx.message.text === "🔙 Скасувати оформлення") {
    await ctx.reply("Оформлення замовлення скасовано.", {
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

    return ctx.scene.leave()
  } else if (ctx.message.text === "Пропустити" && ctx.wizard.cursor === 5) {
    // Пропускаємо коментар
    ctx.session.orderData.comment = ""

    // Розрахунок загальної суми
    const totalPrice = ctx.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Формування повідомлення з деталями замовлення
    const orderDetails =
      "Деталі вашого замовлення:\n\n" +
      ctx.session.cart
        .map(
          (item, index) =>
            `${index + 1}. ${item.name}${item.color ? ` (${item.color})` : ""} - ${item.quantity} шт. - ${item.price * item.quantity} грн`,
        )
        .join("\n") +
      `\n\nЗагальна сума: ${totalPrice} грн\n\n` +
      "Контактна інформація:\n" +
      `Ім'я: ${ctx.session.orderData.customerName}\n` +
      `Телефон: ${ctx.session.orderData.customerPhone}\n` +
      `Email: ${ctx.session.orderData.customerEmail}\n\n` +
      "Адреса доставки:\n" +
      `Область: ${ctx.session.orderData.area}\n` +
      `Місто: ${ctx.session.orderData.city}\n` +
      `Відділення: ${ctx.session.orderData.postOffice}\n\n` +
      `Коментар: Немає`

    await ctx.reply(orderDetails, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Підтвердити замовлення", callback_data: "confirm_order" }],
          [{ text: "🔙 Скасувати замовлення", callback_data: "cancel_checkout" }],
        ],
      },
    })
  }
})
