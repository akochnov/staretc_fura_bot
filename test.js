const dotenv = require("dotenv");
dotenv.config();

const axios = require('axios');

// Set up your API credentials
const API_KEY = process.env.CHATGPT_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Function to send a chat message
async function sendMessage(message) {
  try {
    const response = await axios.post(API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    // Extract the model's reply
    const reply = response.data.choices[0].message.content;
    return reply;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
}

// Usage example
async function main() {
  const userMessage = 'Who won the world series in 2020?';
  const reply = await sendMessage(userMessage);
  console.log('ChatGPT reply:', reply);
}

// Call the main function
main();






