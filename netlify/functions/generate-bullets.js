const fetch = require("node-fetch");

let requestCounts = {}; // Temporary storage for counting requests

exports.handler = async (event) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return { statusCode: 500, body: "Missing API Key" };

    // Get user's IP address
    const userIP = event.headers["client-ip"] || event.headers["x-forwarded-for"] || "unknown";

    // Limit to 3 requests per day per IP
    if (!requestCounts[userIP]) requestCounts[userIP] = 0;
    if (requestCounts[userIP] >= 3) {
        return {
            statusCode: 429,
            body: JSON.stringify({ error: "Limit reached. Try again tomorrow." })
        };
    }
    
    requestCounts[userIP] += 1;

    // Parse user input
    const requestBody = JSON.parse(event.body);
    const jobTitle = requestBody.jobTitle || "Software Engineer";
    const industry = requestBody.industry || "Technology";

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a professional resume writer. Generate three strong, action-oriented resume bullet points based on the user's input." },
                    { role: "user", content: `Generate 3 strong resume bullet points for a ${jobTitle} in ${industry}.` }
                ]
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0].message.content) {
            throw new Error("Invalid response from OpenAI");
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ bullet_points: data.choices[0].message.content.trim().split("\n") })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to generate bullet points", details: error.message }) };
    }
};
