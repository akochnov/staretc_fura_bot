const dotenv = require("dotenv");
dotenv.config();

const telegramAdminChannelID = process.env.TELEGRAM_ADMIN_CHANNEL_ID;
const users = process.env.TELEGRAM_USERS.split(" ");

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const PublicGoogleSheetsParser = require("public-google-sheets-parser");
const parser = new PublicGoogleSheetsParser();
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";

const openaiAPIKey = process.env.OPENAI_API_KEY;
const openai = require("openai");
const gpt = new openai.OpenAI({
    apiKey: openaiAPIKey, 
});

const errorMessage = "Что-то пошло не так, попробуй еще раз";

function log(text) {
    console.log(text);
    bot.telegram.sendMessage(telegramAdminChannelID, text);
}

async function getSpreadSheetValue(key) {
    const rows = await parser.parse(spreadsheetId, sheetName);
    const matchingRows = rows.filter(row => row.q.toLowerCase() === key.trim().toLowerCase());
    if (matchingRows[0]) {
        return matchingRows[0].a?.replaceAll("*", "\n\n");
    }
}

async function handleStart(ctx) {
    try {
        log("Подключился игрок: @" + ctx.update.message.from.username);

        const startMessage = await getSpreadSheetValue("start");
        ctx.reply(startMessage);

    } catch (err) {
        log("Ошибка: " + err);
        ctx.reply(errorMessage);
    }
}


bot.start((ctx) => {
    handleStart(ctx);
});

async function getGPTResponse(message) {
    
    const promptStart = await getSpreadSheetValue("prompt_start");
    const promptEnd = await getSpreadSheetValue("prompt_end");

    const completion = await gpt.chat.completions.create({
        messages: [{ role: "system", content: promptStart+" "+message+" "+promptEnd}],
        model: "gpt-4o",
    });
    
    if (completion) {
        return completion.choices[0]["message"]["content"];
    }
}


async function handleMessage(ctx) {
    try {
        if (ctx.message.chat.id == telegramAdminChannelID) {
            return;
        }

        const original = ctx.message.text;
        log("@"+ctx.update.message.from.username+" написал: "+original);
    
        const response = await getSpreadSheetValue(original);
        
        if (response) {
            log("Бот ответил @"+ctx.update.message.from.username+": "+response);
            ctx.reply(response);
        } 
        else {
            const gptResponse = await getGPTResponse(original);
            log("Бот ответил @"+ctx.update.message.from.username+": "+gptResponse);
            ctx.reply(gptResponse);                  
        }
    } catch (err) {
        log("Ошибка: " + err);
        ctx.reply(errorMessage);
    }
}

bot.on("text", ctx => { 
    handleMessage(ctx);
});


bot.launch();
log("Бот запущен");


// Enable graceful stop
process.once("SIGINT", () => {
    log("Бот остановлен");
    bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
    log("Бот остановлен");
    bot.stop("SIGTERM");
});
