const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
app.use(express.json());
require('dotenv').config();
const cors = require("cors");
app.use(cors());
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 

app.post('/run', async (req, res) => {
    try {
        const { codeInput, userRequest, conversionTarget } = req.body; 
        let requestMessage;
        if (userRequest === "GenerateOutput") {
            requestMessage = `Generate the output for this code: ${codeInput}`;
        } else if (userRequest === "DebugCode") {
            requestMessage = `Debug the following code: ${codeInput}. Provide the issue and updated code.`;
        } else if (userRequest === "CheckQuality") {
            requestMessage = `Review this code: ${codeInput}. Check its quality and provide feedback with percentages of different criteria and improvement suggestions.`;
        } else if (userRequest === "ConvertCode") {
            requestMessage = `Convert this code: ${codeInput} to ${conversionTarget}`;
        }

        const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: requestMessage }],
                max_tokens: 1000
            })
        });

        const responseData = await response.json();

        // Check if response.choices is defined and not empty
        if (responseData.choices && responseData.choices.length > 0) {
            const generatedResponse = responseData.choices[0].message.content;
            res.status(200).send({ processedCode: generatedResponse });
        } else {
            // Handle the case when response.choices is empty
            res.status(500).send({ msg: "No valid response from the API" });
        }
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).send({ msg: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
