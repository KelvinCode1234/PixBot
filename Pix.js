document.addEventListener("DOMContentLoaded", () => {
    const togglerButton = document.querySelector(".PixBot-toggler");
    const PixBotContainer = document.querySelector(".PixBot");
    const closeButton = document.querySelector(".PixBot header i");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendButton = document.querySelector(".chat-input span");
    const chatBox = document.querySelector(".chatbox");

    let userName = localStorage.getItem('userName') || null; // Retrieve from local storage if available

    // Toggle PixBot visibility when toggler button is clicked
    togglerButton.addEventListener("click", () => {
        PixBotContainer.classList.toggle("show-PixBot");
    });

    // Close PixBot when the close button (X) is clicked
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

        if (input === "what is your name?" || input === "what's your name?") {
            if (!userName) {
                response.brief = "I'm PixBot. What's your name?";
                userName = null; 
            } else {
                response.brief = `Hi ${userName}, I'm PixBot. Nice to chat with you again!`;
            }
        } else if (!userName && input.startsWith("my name is ")) {
            userName = input.slice(11).trim();
            localStorage.setItem('userName', userName);  // Store the name in localStorage
            response.brief = `Nice to meet you, ${userName}! How can I help you?`;
        } else if (input === "make it full" || input === "more") {
            isBrief = false; // Display full info when "make it full" or "more" is typed
        } else if (input === "hi" || input === "hello" || input === "how are you?") {
            response.brief = "Hello! How can I help you?";
        } else if (input === "what is a name?" || input === "what is a name") {
            response = await getTechAnswer("What is a name");
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

    // Listen for "Enter" key press
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

    // Send button click event
    sendButton.addEventListener("click", () => {
        if (chatInput.value.trim() !== "") {
            addMessage(chatInput.value, "outgoing");
            processInput(chatInput.value);
            chatInput.value = ""; 
        }
    });
});
