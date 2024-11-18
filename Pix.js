document.addEventListener("DOMContentLoaded", () => {
    const togglerButton = document.querySelector(".PixBot-toggler");
    const PixBotContainer = document.querySelector(".PixBot");
    const closeButton = document.querySelector(".PixBot header i");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendButton = document.querySelector(".chat-input span");
    const chatBox = document.querySelector(".chatbox");

    let userName = localStorage.getItem('userName') || null; 

    togglerButton.addEventListener("click", () => {
        PixBotContainer.classList.toggle("show-PixBot");
    });

    closeButton.addEventListener("click", () => {
        PixBotContainer.classList.remove("show-PixBot");
    });

    function addMessage(content, type = "incoming") {
        const chat = document.createElement("li");
        chat.classList.add("chat", type);

        const messageContent = type === "incoming" 
            ? `<span class="material-symbols-outlined">robot_2</span><p>${content}</p>` 
            : `<p>${content}</p>`;

        chat.innerHTML = messageContent;
        chatBox.appendChild(chat);

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function processInput(input) {
        let response = { brief: "", full: "" };
        let isBrief = true;

        input = input.trim().toLowerCase();

        if (!input) return;

        if (input === "what is your name?" || input === "what's your name?" || input === "what's your name?" || input === "what is your name?" || input === "what's your name") {
            if (!userName) {
                response.brief = "I'm PixBot. What's your name?";
                userName = null; 
            } else {
                response.brief = `Hi ${userName}, I'm PixBot. Nice to chat with you again!`;
            }
        } else if (!userName && (input.startsWith("i'm ") || input.startsWith("my name is ") || input.startsWith("i am "))) {

            if (input.startsWith("i'm ")) {
                userName = input.slice(4).trim();
            } else if (input.startsWith("my name is ")) {
                userName = input.slice(11).trim();
            } else if (input.startsWith("i am ")) {
                userName = input.slice(5).trim();
            }

            localStorage.setItem('userName', userName);
            response.brief = `Nice to meet you, ${userName}! How can I help you?`;
        } else if (input === "make it full" || input === "more") {
            isBrief = false;
        } else if (input === "hi" || input === "hello" || input === "how are you?" || input === "hello pixbot" || input === "hello PixBot" || input === "hey") {
            response.brief = "Hello! How can I help you?";
        } else if (input.includes("add") || input.includes("plus") || input.includes("subtract") || input.includes("multiply") || input.includes("divide")) {
            try {
                const mathExpression = input
                    .replace(/what's|what is|calculate|can you/gi, "")
                    .replace(/add|plus/gi, "+")
                    .replace(/subtract|minus/gi, "-")
                    .replace(/multiply|times/gi, "*")
                    .replace(/divide|by/gi, "/")
                    .trim();
            
                if (/^[0-9+\-*/().\s]+$/.test(mathExpression)) {
                    const result = math.evaluate(mathExpression);
                    response.brief = `The answer is ${result}.`;
                    response.full = `For your query '${input}', the calculated answer is ${result}.`;
                } else {
                    response.brief = "Sorry, I couldn't calculate that. Please provide a proper mathematical query.";
                }
            } catch {
                response.brief = "Sorry, I couldn't calculate that. Please check your input.";
            }
            
        } else if (input.includes("are you a bot") || input.includes("are you an ai")) {
            const options = [
                "Yes, I'm PixBot, an AI here to assist you!",
                "I am an AI, and I'm here to help. Ask me anything!",
                "Yes, I'm an AI bot. Let me know how I can assist you!"
            ];
            const randomResponse = options[Math.floor(Math.random() * options.length)];
            response.brief = `${randomResponse}`;
        } else {
            try {
                const result = math.evaluate(input);
                response.brief = `The answer is ${result}.`;
                response.full = `For your query '${input}', the calculated answer is ${result}.`;
            } catch {
                response = await getTechAnswer(input);
            }
        }

        addMessage(isBrief ? response.brief : response.full, "incoming");
    }


    // Fetch answer from the API
    async function getTechAnswer(query) {
        const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.Abstract) {
                return {
                    brief: data.AbstractText.split(".")[0] + ".",
                    full: data.Abstract,
                };
            } else if (data.RelatedTopics.length > 0) {
                return {
                    brief: data.RelatedTopics[0].Text.split(".")[0] + ".",
                    full: data.RelatedTopics[0].Text,
                };
            } else {
                return {
                    brief: "I couldn't find an answer. Please try another question.",
                    full: "I couldn't find an answer. Try rephrasing your question to get more detailed results.",
                };
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return {
                brief: "Oops, there was an error fetching the answer.",
                full: "There was an error connecting to the server. Please try again later or rephrase your question.",
            };
        }
    }

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); 
            if (chatInput.value.trim() !== "") {
                addMessage(chatInput.value, "outgoing");
                processInput(chatInput.value);
                chatInput.value = ""; 
            }
        }
    });

    sendButton.addEventListener("click", () => {
        if (chatInput.value.trim() !== "") {
            addMessage(chatInput.value, "outgoing");
            processInput(chatInput.value);
            chatInput.value = ""; 
        }
    });
});
