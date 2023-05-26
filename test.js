const dotenv = require("dotenv");
dotenv.config();

const PublicGoogleSheetsParser = require('public-google-sheets-parser')

const spreadsheetId = process.env.SPREADSHEET_ID

// 1. You can pass spreadsheetId when instantiating the parser:
const parser = new PublicGoogleSheetsParser()
parser.parse(spreadsheetId, 'Sheet1').then((items) => {
  // items should be [{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},{"a":7,"b":8,"c":9}]
  console.log(items.map(i => i.a));
})





