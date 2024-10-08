document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("inputField");
    const sendButton = document.getElementById("sendButton");
    const chatHistory = document.getElementById("chatHistory");
    const historyButton = document.getElementById("historyButton");
  
    const API_URL = "https://6088-34-139-251-69.ngrok-free.app";
  
    // Function to update chat history
    function updateChatHistory(userInput, botResponse) {
      const userMessage = document.createElement("div");
      userMessage.classList.add("message", "user");
      userMessage.textContent = userInput;
  
      const botMessage = document.createElement("div");
      botMessage.classList.add("message", "bot");
      botMessage.textContent = botResponse;
  
      chatHistory.appendChild(userMessage);
      chatHistory.appendChild(botMessage);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  
    // Function to send a question and handle responses
    async function sendQuestion() {
      const userInput = inputField.value;
      inputField.value = "";
  
      // Update UI to show user input
      updateChatHistory(userInput, "Thinking...");
  
      try {
        const response = await fetch(`${API_URL}/ask?input=${encodeURIComponent(userInput)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          const botResponse = data.answer || "I couldn't process that.";
          updateChatHistory(userInput, botResponse);
        } else {
          throw new Error('Error in response');
        }
      } catch (error) {
        console.error('Error fetching AI response:', error);
        updateChatHistory(userInput, "There was an error processing your request.");
      }
    }
  
    // Function to retrieve chat history
    async function loadChatHistory() {
      try {
        const response = await fetch(`${API_URL}/history`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          chatHistory.innerHTML = "";  // Clear the chat history UI
          data.chat_history.forEach((message, index) => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", index % 2 === 0 ? "user" : "bot");
            messageDiv.textContent = message;
            chatHistory.appendChild(messageDiv);
          });
        } else {
          throw new Error('Error retrieving history');
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    }
  
    // Event listeners for buttons
    sendButton.addEventListener("click", sendQuestion);
    historyButton.addEventListener("click", loadChatHistory);
  
    // Optional: Handle Enter key to send the message
    inputField.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        sendQuestion();
      }
    });
  });
  