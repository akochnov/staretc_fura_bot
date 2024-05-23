require("dotenv").config();
const { OpenAIApi } = require("openai");

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

async function callGptApi(prompt) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003", // or any other model you want to use
            prompt: prompt,
            max_tokens: 100, // adjust the number of tokens as needed
            temperature: 0.7, // adjust the temperature as needed
        });

        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error("Failed to call OpenAI API");
    }
}

// Example usage
callGptApi("Tell me a joke").then(response => {
    console.log("GPT-3 Response:", response);
}).catch(error => {
    console.error("Error:", error);
});

module.exports = { callGptApi };
