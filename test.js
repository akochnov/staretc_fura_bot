const dotenv = require("dotenv");
dotenv.config();


const PublicGoogleSheetsParser = require("public-google-sheets-parser");
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";
const parser = new PublicGoogleSheetsParser();


console.log(spreadsheetId, sheetName);

async function getSpreadSheetValue(key) {
    const rows = await parser.parse(spreadsheetId, sheetName);
    const matchingRows = rows.filter(row => row.q.toLowerCase() === key);
    if (matchingRows[0]) {
        return matchingRows[0].a?.replaceAll("*", "\n\n");
    }
}

const question = "prompt_end";
console.log("question: "+question);
getSpreadSheetValue(question).then((answer) => console.log(answer));