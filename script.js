async function askQuestion() {
    const question = document.getElementById('question').value;
    const apiUrl = 'https://6088-34-139-251-69.ngrok-free.app/ask?input=' + encodeURIComponent(question);

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Check if the response is in JSON format
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            // Parse response as JSON
            const data = await response.json();
            
            // Display the answer and context
            document.getElementById('response').innerText = data.answer;
            const contextData = data.context.map(item => `${item.metadata.source}\n${item.page_content}\n\n`).join('');
            document.getElementById('context').innerText = contextData;
        } else {
            // If not JSON, convert the response to text
            const textData = await response.text();
            
            // Optionally, convert the text into a JSON-like object
            const fallbackData = {
                answer: "Non-JSON response received",
                responseText: textData
            };

            // Display the fallback response
            document.getElementById('response').innerText = fallbackData.answer;
            document.getElementById('context').innerText = fallbackData.responseText;
        }

    } catch (error) {
        console.error('Error fetching API:', error);
        document.getElementById('response').innerText = `Error: ${error.message}`;
    }
}
