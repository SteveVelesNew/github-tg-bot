const TOKEN = '735909848:AAHKiTkx1KKrKAmO1we-5Vp4tibarmQULOI'
const TelegramBot = require('node-telegram-bot-api')
const _ = require('lodash')
const fs = require('fs')
const request = require('request')
//============================//
require('http').createServer().listen(process.env.PORT || 5000).on('request', function(req, res){
    res.end('')
})﻿
//============================//

// екземпляр класу бота
const bot = new TelegramBot(TOKEN, {
    polling: true
})
// екземпляр класу бота


// глобальне визначення всих пунктыв меню
const KB = {
    currency: 'Курс валют',
    picture: 'Картинкы',
    cat: 'Котик',
    car: 'Машина',
    dog: 'Пёсик',
    back: 'Назад'
}

const PicScrs = {
    [KB.cat]: [
        'cat1.jpg',
        'cat2.jpg'
    ],
    [KB.car]: [
        'car1.jpg',
        'car2.jpg',
        'car3.png'
    ],
    [KB.dog]: [
        'dog1.jpg',
        'dog2.jpg'
    ]
}

bot.onText(/\/start/, msg => {
    // інформація про повідомлення в консьль
    //console.log(msg)
    sendGreeting(msg    , true)

})

bot.on('message', msg=>{

    switch (msg.text) {
        case KB.picture:
            sendPictureScreen(msg.chat.id)
            break
        case KB.currency:
            sendCurrencyScreen(msg.chat.id)
            break
        case KB.back:
            sendGreeting(msg, false)
            break
        case KB.car:
        case KB.cat:
        case KB.dog:
            sendPictureByName(msg.chat.id, msg.text)
            break
    }
})

bot.on('callback_query', query =>{
    // console.log(JSON.stringify(query, null, 2))
    const base = query.data
    const symbol = 'RUB'

    bot.answerCallbackQuery({
        callback_query_id: query.id,
        text: `Вы выбрали ${base}`
    })

    request(`http://data.fixer.io/api/latest?access_key=7c8200c8f951782a50f287ebb456da91&symbols=${symbol}&base=${base}`, (error,response, body) => {
        if (error) throw new Error(error)
        if (response.statusCode === 200) {

            const currencyData = JSON.parse(body)
            console.log(currencyData.rates)


            const html = `<b>1 ${base}</b> - <em>${currencyData.rates[symbol]} ${symbol}</em>`
            bot.sendMessage(query.message.chat.id, html, {
                parse_mode: 'HTML'
            })


        }
    })

})




function sendGreeting(msg, sayHello = true) {
    const text = sayHello
        ? `Приветствую, ${msg.from.first_name}\nЧто вы хотите сделать?`
        : `Что вы хотите ещё? `

    bot.sendMessage(msg.chat.id, text, {
        reply_markup: {
            keyboard: [
                [KB.currency, KB.picture],
                [KB.currency, KB.picture, KB.picture]
            ]
        }
    })

}

function sendPictureScreen(chatId) {
    bot.sendMessage(chatId, 'Выбирите картинки:', {
        reply_markup: {
            keyboard: [
                [KB.car, KB.cat, KB.dog],
                [KB.back]
            ]
        }
    })
}

function sendPictureByName(chatId, picName) {
    const srcs = PicScrs[picName]

    const src = srcs[_.random(0, srcs.length - 1)]

    bot.sendMessage(chatId, `Загружаю....`)

    fs.readFile(`${__dirname}/Picture/${src}`, (error, picture) => {

        if (error) throw new Error(error)
        bot.sendPhoto(chatId, picture).then(() => {
            bot.sendMessage(chatId, `Отправлено!`)

        })

    })
}

function sendCurrencyScreen(chatId){
    bot.sendMessage(chatId, `Выберите тип валюты: `, {
        reply_markup: {
            inline_keyboard: [
                // [
                //     {
                //        text: 'Гривна',
                //        callback_data: 'USD'
                //     }
                // ],
                [
                    {
                        text: 'Евро',
                        callback_data: 'EUR'
                    }
                ]
            ]

        }
    })

}


// curl -F "url=https://telegram-bot-zztjfeqtga.now.sh/new-message"
// https://api.telegram.org/bot<your_api_token>/setWebhook


//lesson
//https://github.com/hosein2398/node-telegram-bot-api-tutorial/blob/master/README.md
// онлайн запиит (валюта)
// https://fixer.io/dashboard

//deploy
//https://www.youtube.com/watch?time_continue=38&v=IuUY-OJ0GXE
//2.3 (dog, ещё)

