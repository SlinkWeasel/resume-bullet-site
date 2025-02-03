const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in Netlify

        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API Key");
        }

        // Parse user input
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const jobTitle = requestBody.jobTitle || "Software Engineer";
        const industry = requestBody.industry || "Technology";

        console.log("Received Input:", { jobTitle, industry });

        // Call OpenAI API
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
        console.log("OpenAI Response:", JSON.stringify(data));

        // Check if OpenAI returned valid data
        if (!data.choices || !data.choices[0].message.content) {
            throw new Error("Invalid response from OpenAI");
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ bullet_points: data.choices[0].message.content.trim().split("\n") })
        };

    } catch (error) {
        console.error("Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate bullet points", details: error.message })
        };
    }
};

