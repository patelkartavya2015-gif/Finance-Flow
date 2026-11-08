document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // ELEMENTS
    // =========================================================

    const form = document.getElementById("aiForm");

    const input = document.getElementById("aiMessage");

    const sendButton = form
        ? form.querySelector("button[type='submit']")
        : null;

    const messages = document.getElementById(
        "chatMessages"
    );


    console.log("✦ Flowy AI loaded");


    // =========================================================
    // CHECK ELEMENTS
    // =========================================================

    if (!form) {
        console.error("❌ aiForm not found");
        return;
    }

    if (!input) {
        console.error("❌ aiMessage not found");
        return;
    }

    if (!sendButton) {
        console.error("❌ Send button not found");
        return;
    }

    if (!messages) {
        console.error("❌ chatMessages not found");
        return;
    }


    // =========================================================
    // CLEAN AI MARKDOWN
    // =========================================================

    function cleanAIText(text) {

        return String(text)

            // Bold
            .replace(/\*\*(.*?)\*\*/g, "$1")

            // Underline / bold
            .replace(/__(.*?)__/g, "$1")

            // Italic
            .replace(
                /(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)/g,
                "$1"
            )

            // Inline code
            .replace(/`([^`]+)`/g, "$1")

            // Headings
            .replace(
                /^\s*#{1,6}\s+/gm,
                ""
            )

            // Markdown bullets
            .replace(
                /^\s*[-*+]\s+/gm,
                "• "
            )

            // Too many blank lines
            .replace(
                /\n{3,}/g,
                "\n\n"
            )

            .trim();
    }


    // =========================================================
    // SCROLL
    // =========================================================

    function scrollToBottom() {

        messages.scrollTop =
            messages.scrollHeight;
    }


    // =========================================================
    // ADD MESSAGE
    // =========================================================

    function addMessage(
        role,
        text = ""
    ) {

        const message =
            document.createElement("div");

        message.className =
            `ai-message ${role}`;


        const bubble =
            document.createElement("div");

        bubble.className =
            "ai-bubble";


        bubble.textContent =
            cleanAIText(text);


        message.appendChild(
            bubble
        );

        messages.appendChild(
            message
        );


        scrollToBottom();


        return bubble;
    }


    // =========================================================
    // TYPEWRITER
    // =========================================================

    async function typewriter(
        element,
        text,
        speed = 18
    ) {

        const cleanedText =
            cleanAIText(text);


        element.textContent = "";


        const cursor =
            document.createElement("span");

        cursor.className =
            "typing-cursor";

        cursor.textContent =
            "▌";


        element.appendChild(
            cursor
        );


        for (
            let i = 0;
            i < cleanedText.length;
            i++
        ) {

            cursor.before(
                document.createTextNode(
                    cleanedText[i]
                )
            );


            scrollToBottom();


            await new Promise(
                resolve => {
                    setTimeout(
                        resolve,
                        speed
                    );
                }
            );
        }


        cursor.remove();
    }


    // =========================================================
    // SHOW TYPING INDICATOR
    // =========================================================

    function showTyping() {

        hideTyping();


        const message =
            document.createElement("div");

        message.className =
            "ai-message assistant";

        message.id =
            "flowyTyping";


        const bubble =
            document.createElement("div");

        bubble.className =
            "ai-bubble ai-typing-bubble";


        bubble.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;


        message.appendChild(
            bubble
        );

        messages.appendChild(
            message
        );


        scrollToBottom();
    }


    // =========================================================
    // HIDE TYPING INDICATOR
    // =========================================================

    function hideTyping() {

        const typing =
            document.getElementById(
                "flowyTyping"
            );


        if (typing) {
            typing.remove();
        }
    }


    // =========================================================
    // SET LOADING
    // =========================================================

    function setLoading(
        loading
    ) {

        input.disabled =
            loading;

        sendButton.disabled =
            loading;


        if (loading) {

            sendButton.dataset.originalHTML =
                sendButton.innerHTML;


            sendButton.innerHTML = `
                <span class="ai-send-loading"></span>
            `;

        } else {

            if (
                sendButton.dataset.originalHTML
            ) {

                sendButton.innerHTML =
                    sendButton.dataset.originalHTML;
            }
        }
    }


    // =========================================================
    // SEND MESSAGE
    // =========================================================

    async function sendMessage() {

        const message =
            input.value.trim();


        if (!message) {
            return;
        }


        console.log(
            "📤 Sending:",
            message
        );


        // -----------------------------------------------------
        // USER MESSAGE
        // -----------------------------------------------------

        addMessage(
            "user",
            message
        );


        // -----------------------------------------------------
        // CLEAR INPUT
        // -----------------------------------------------------

        input.value = "";


        // -----------------------------------------------------
        // LOADING
        // -----------------------------------------------------

        setLoading(true);


        // -----------------------------------------------------
        // TYPING INDICATOR
        // -----------------------------------------------------

        showTyping();


        try {

            console.log(
                "🌐 Calling /api/ai/chat"
            );


            const response =
                await fetch(
                    "/api/ai/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message: message
                        })
                    }
                );


            console.log(
                "📡 Server status:",
                response.status
            );


            // -------------------------------------------------
            // READ SERVER RESPONSE
            // -------------------------------------------------

            const rawText =
                await response.text();


            console.log(
                "📥 Server response:",
                rawText
            );


            let data;


            try {

                data =
                    JSON.parse(
                        rawText
                    );

            } catch (error) {

                hideTyping();


                addMessage(
                    "assistant",
                    "Flowy received an invalid response from the server."
                );


                console.error(
                    "❌ Invalid JSON:",
                    rawText
                );


                return;
            }


            hideTyping();


            // -------------------------------------------------
            // HTTP ERROR
            // -------------------------------------------------

            if (!response.ok) {

                addMessage(
                    "assistant",
                    data.message ||
                    data.error ||
                    "Something went wrong while contacting Flowy."
                );


                console.error(
                    "❌ API error:",
                    data
                );


                return;
            }


            // -------------------------------------------------
            // FLASK ERROR
            // -------------------------------------------------

            if (
                data.success === false
            ) {

                addMessage(
                    "assistant",
                    data.message ||
                    "Flowy couldn't answer that."
                );


                return;
            }


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            const aiText =
                data.response ||
                data.answer ||
                data.reply ||
                data.message;


            if (!aiText) {

                addMessage(
                    "assistant",
                    "Flowy didn't return a response."
                );


                console.error(
                    "❌ No AI response:",
                    data
                );


                return;
            }


            // -------------------------------------------------
            // EMPTY AI BUBBLE
            // -------------------------------------------------

            const assistantBubble =
                addMessage(
                    "assistant",
                    ""
                );


            // -------------------------------------------------
            // TYPEWRITER
            // -------------------------------------------------

            await typewriter(
                assistantBubble,
                String(aiText),
                18
            );


        } catch (error) {

            console.error(
                "❌ Flowy error:",
                error
            );


            hideTyping();


            addMessage(
                "assistant",
                "I couldn't connect to Flowy. Please try again."
            );


        } finally {

            setLoading(false);

            input.focus();

            scrollToBottom();
        }
    }


    // =========================================================
    // FORM SUBMIT
    // =========================================================

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (
                !sendButton.disabled
            ) {

                sendMessage();
            }
        }
    );


    // =========================================================
    // ENTER KEY
    // =========================================================

    input.addEventListener(
        "keydown",
        event => {

            // Enter sends.
            // Shift + Enter makes a new line.

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();


                if (
                    !sendButton.disabled
                ) {

                    sendMessage();
                }
            }
        }
    );


    // =========================================================
    // START
    // =========================================================

    input.focus();

    scrollToBottom();


    console.log(
        "✅ Flowy is ready"
    );

});
