exports.handler = async (event) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Uses Netlify's stored API key

    const requestBody = JSON.parse(event.body);
    const jobTitle = requestBody.jobTitle || "Software Engineer";
    const industry = requestBody.industry || "Technology";

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
    
    return {
        statusCode: 200,
        body: JSON.stringify({ bullet_points: data.choices[0].message.content })
    };
};
