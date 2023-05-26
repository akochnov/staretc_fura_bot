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


bot.start((ctx) => {
    try {
        bot.telegram.sendMessage(telegramAdminChannelID, "Подключился игрок: @"+ctx.update.message.from.username);
        
        parser.parse(spreadsheetId, "Sheet1").then((items) => {
            const item = items.filter(i => {return i.q.toLowerCase() === "start";});
            if (item.length > 0) ctx.reply(item[0].a);
            else ctx.reply(iDontKnowTheAnswer);
        });
    } catch (err) {
        console.log(err);
        bot.telegram.sendMessage(telegramAdminChannelID, "Ошибка: "+err);
    }

});


bot.on("text", ctx => {
    try {    
        const original = ctx.message.text;
        console.log(original);

        if (ctx.message.chat.id == telegramAdminChannelID) {
            return;
        }
        
        bot.telegram.sendMessage(telegramAdminChannelID, "@"+ctx.update.message.from.username+" написал: "+original);


        if (users.includes(ctx.update.message.from.username)) {

        }

        parser.parse(spreadsheetId, "Sheet1").then((items) => {
            //console.log(items);
            const item = items.filter(i => {return i.q.trim().toLowerCase() === original.trim().toLowerCase();});
            console.log(item);
            if (item.length != 0) ctx.reply(item[0].a);
            else ctx.reply(iDontKnowTheAnswer);
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
