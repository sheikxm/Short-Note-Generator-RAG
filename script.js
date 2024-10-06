document.getElementById('send-btn').addEventListener('click', async () => {
    const inputField = document.getElementById('user-input');
    const userInput = inputField.value.trim();

    if (!userInput) return;

    // Display user input in the chat
    displayMessage('user', userInput);

    // Send the question to the backend
    const response = await askQuestion(userInput);

    // Display the bot's response in the chat
    displayMessage('bot', response.answer);

    // Clear the input field
    inputField.value = '';
});

async function askQuestion(question) {
    const response = await fetch('https://3331-34-80-148-202.ngrok-free.app/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question: question,
            chat_history: [],
        }),
    });

    return response.json();
}

function displayMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');

    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.textContent = message;

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}
