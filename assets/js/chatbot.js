const apiKey = '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';
const apiUrl = 'https://api.openai.com/v1/chat/completions';

const clientConfig = {
    organization: 'org-AkfCQJUenxuuqqPZmaX7nIW5',
};

const PREMISE = "Eres un asistente experto en hardware de PC y rendimiento de videojuegos. Tu tarea es ayudar a los usuarios a simular una configuración de PC proporcionando detalles sobre los componentes, como procesador, tarjeta gráfica, memoria RAM, y almacenamiento. Basado en la configuración proporcionada, determina qué juegos pueden correr en esa PC. Da 4 opciones. no respondas preguntas que no tengan que ver con el tema";

let conversationHistory = [
    { role: 'system', content: PREMISE }
];

function showInitialMessage() {
    const messageContainer = document.getElementById("messages");

    const initialMessage = "¡Hola! Soy un asistente experto en hardware de PC y rendimiento de videojuegos. Proporcióname las especificaciones de tu PC, y te recomendaré qué juegos puedes correr y a qué nivel de rendimiento. 😊";
    
    const botMessageElement = document.createElement("div");
    botMessageElement.className = "message bot-message";
    botMessageElement.innerText = initialMessage;
    messageContainer.appendChild(botMessageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    conversationHistory.push({ role: 'assistant', content: initialMessage });
}

window.onload = function() {
    showInitialMessage();
};

async function getCompletion(prompt) {
    conversationHistory.push({ role: 'user', content: prompt });

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Organization': clientConfig.organization
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: conversationHistory
        })
    });

    if (!response.ok) {
        throw new Error("Error al realizar la solicitud a la API");
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content.trim();

    conversationHistory.push({ role: 'assistant', content: botMessage });

    return botMessage;
}

function sendMessage() {
    const userInput = document.getElementById("user-input");
    const messageContainer = document.getElementById("messages");
    const sendButton = document.getElementById("send-button");

    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    // Animate send button
    sendButton.classList.add("send-animation");
    sendButton.disabled = true;
    setTimeout(() => {
        sendButton.classList.remove("send-animation");
        sendButton.disabled = false;
    }, 500);

    // Mostrar el mensaje del usuario
    const userMessageElement = document.createElement("div");
    userMessageElement.className = "message user-message";
    userMessageElement.innerText = userMessage;
    messageContainer.appendChild(userMessageElement);

    // Limpiar el input
    userInput.value = "";
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Mostrar indicador de escritura del bot
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "message bot-message typing";
    typingIndicator.innerText = "Escribiendo...";
    messageContainer.appendChild(typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Llamar a la API de OpenAI y mostrar la respuesta
    getCompletion(userMessage)
        .then(function(botMessage) {
            // Eliminar el indicador de escritura
            messageContainer.removeChild(typingIndicator);

            // Mostrar la respuesta del chatbot
            const botMessageElement = document.createElement("div");
            botMessageElement.className = "message bot-message";
            botMessageElement.innerText = botMessage;
            messageContainer.appendChild(botMessageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(function(error) {
            // Eliminar el indicador de escritura
            messageContainer.removeChild(typingIndicator);

            // Mostrar el error en caso de que ocurra
            const errorMessageElement = document.createElement("div");
            errorMessageElement.className = "message bot-message";
            errorMessageElement.innerText = "Ocurrió un error: " + error.message;
            messageContainer.appendChild(errorMessageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
}

// Escuchar el evento "Enter" para enviar el mensaje
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});