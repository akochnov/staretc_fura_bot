const dotenv = require("dotenv");
const { Telegraf } = require("telegraf");

const PublicGoogleSheetsParser = require("public-google-sheets-parser");

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const users = process.env.TELEGRAM_USERS.split(" ");
users.push(process.env.TELEGRAM_BOT_OWNER);

const spreadsheetId = process.env.SPREADSHEET_ID;

const telegramAdminChannelID = process.env.TELEGRAM_ADMIN_CHANNEL_ID;

const parser = new PublicGoogleSheetsParser();

const iDontKnowTheAnswer = "Не знаю ответа"

var questions = [];

var answerCodes = [];


bot.start((ctx) => {
    try {
        bot.telegram.sendMessage(telegramAdminChannelID, "Подключился игрок: @"+ctx.update.message.from.username);
        
        parser.parse(spreadsheetId, "Sheet1").then((items) => {
            const item = items.filter(i => {return i.q.toLowerCase() === "start";});
            if (item.length > 0) ctx.reply(item[0].a.replaceAll("*","\n\n"));
            else ctx.reply(iDontKnowTheAnswer);
        });
    } catch (err) {
        console.log(err);
        bot.telegram.sendMessage(telegramAdminChannelID, "Ошибка: "+err);
    }

});




bot.on("text", ctx => {
    try {    
        const original = ctx.message.text.trim().toLowerCase();
        console.log(original);

        if (users.includes(ctx.update.message.from.username)) {
            if (original == "reset") {
                questions = [];
                answerCodes = [];
                ctx.reply("Правильные ответы сброшены");
            }
        }       

        if (ctx.message.chat.id == telegramAdminChannelID) {
            return;
        }
        
        bot.telegram.sendMessage(telegramAdminChannelID, "@"+ctx.update.message.from.username+" написал: "+original);




        parser.parse(spreadsheetId, "Sheet1").then((items) => {
            //console.log(items);
            const questionCount = items.filter(i => i.code).length;
            const item = items.filter(i => {return i.q.trim().toLowerCase() === original;});
            //console.log(item);
            if (item.length != 0) {
                if (!questions.includes(original)) questions.push(original);
                
                if (!item[0].code || item[0].code == "" || questions.includes(item[0].code)) {
                    ctx.reply(item[0].a.replaceAll("*","\n\n"));
                    if (item[0].code && !answerCodes.includes(item[0].code)) {
                        answerCodes.push(item[0].code);
                    }
                } else {
                    ctx.reply("Не хитри!");
                }
            } else {
                ctx.reply(iDontKnowTheAnswer);
            }
            if (answerCodes.length == questionCount) {
                setTimeout(()=> ctx.reply("Поздравлямбы! Вы собрали Катю в школу"), 500);
                bot.telegram.sendMessage(telegramAdminChannelID, "@"+ctx.update.message.from.username+" написал: "+original);
            }
        });
    } catch (err) {
        console.log(err);
        bot.telegram.sendMessage(telegramAdminChannelID, "Ошибка: "+err);
    }

})





bot.launch();
console.log("Bot is running...");


// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
