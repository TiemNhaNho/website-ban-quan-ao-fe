(function () {
  // Configuration
  const WEBHOOK_URL =
    "https://n8n-agrccjay.ap-southeast-1.clawcloudrun.com/webhook/aefc3771-65ed-4506-b679-27401663021e";
  const SESSION_KEY = "admin-123";

  // Helper: Markdown Parser (Basic)
  function parseMarkdown(text) {
    if (!text) return "";

    // Escape HTML to prevent XSS (basic)
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Bullet points: * text -> <ul><li>text</li></ul>
    // This is a simple implementation. For nested lists or complex structures, a library is better.
    // We'll split by newlines and check for lines starting with *
    const lines = html.split("\n");
    let inList = false;
    let processedLines = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("* ")) {
        if (!inList) {
          processedLines.push("<ul>");
          inList = true;
        }
        processedLines.push(`<li>${trimmed.substring(2)}</li>`);
      } else {
        if (inList) {
          processedLines.push("</ul>");
          inList = false;
        }
        processedLines.push(line);
      }
    });
    if (inList) processedLines.push("</ul>");

    return processedLines
      .join("<br>")
      .replace(/<ul><br>/g, "<ul>")
      .replace(/<\/ul><br>/g, "</ul>");
  }

  // Helper: Session Management
  function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = "admin-" + Date.now();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  // Inject HTML
  function injectChatbot() {
    const chatbotHTML = `
            <button class="chatbot-trigger" id="chatbotTrigger">
                <i class="icon icon-message-circle"></i> <!-- Assuming icon class exists, else unicode -->
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <h3>TiemNhaNho AI Assistant</h3>
                    <button class="close-chat" id="closeChat">&times;</button>
                </div>
                <div class="chatbot-body" id="chatBody">
                    <div class="message ai">
                        <div class="message-content">Hello! How can I help you manage the store today?</div>
                    </div>
                    <div class="loading-indicator" id="loadingIndicator">
                        <div class="loading-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                </div>
                <div class="chatbot-footer">
                    <input type="text" class="chatbot-input" id="chatInput" placeholder="Type a message...">
                    <button class="send-btn" id="sendBtn">
                        <i class="icon icon-send"></i> <!-- Assuming icon class exists, else unicode -->
                    </button>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);

    // If icons don't load, fallback to text/unicode
    const triggerBtn = document.getElementById("chatbotTrigger");
    if (triggerBtn.querySelector(".icon").offsetWidth === 0) {
      triggerBtn.innerHTML = "💬";
    }

    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn.querySelector(".icon").offsetWidth === 0) {
      sendBtn.innerHTML = "➤";
    }
  }

  // Main Logic
  function init() {
    injectChatbot();

    const trigger = document.getElementById("chatbotTrigger");
    const windowEl = document.getElementById("chatbotWindow");
    const closeBtn = document.getElementById("closeChat");
    const sendBtn = document.getElementById("sendBtn");
    const input = document.getElementById("chatInput");
    const chatBody = document.getElementById("chatBody");
    const loadingIndicator = document.getElementById("loadingIndicator");

    // Toggle Visibility
    const toggleChat = () => windowEl.classList.toggle("active");
    trigger.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", toggleChat);

    // Add Message
    function addMessage(text, sender) {
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message", sender);

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("message-content");
      contentDiv.innerHTML =
        sender === "ai"
          ? parseMarkdown(text)
          : parseMarkdown(text).replace(/<br>/g, ""); // User msg raw text mostly

      msgDiv.appendChild(contentDiv);
      chatBody.insertBefore(msgDiv, loadingIndicator);
      scrollToBottom();
    }

    function scrollToBottom() {
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Handle Send
    async function handleSend() {
      const message = input.value.trim();
      if (!message) return;

      // UI Updates
      addMessage(message, "user");
      input.value = "";
      input.disabled = true;
      sendBtn.disabled = true;
      loadingIndicator.style.display = "block";
      scrollToBottom();

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatInput: message,
            sessionId: getSessionId(),
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // Expecting data.output based on prompt "The response contains the message in the output field"
        const aiMessage =
          data.output || "I received your message but got no output.";

        addMessage(aiMessage, "ai");
      } catch (error) {
        console.error("Chat error:", error);
        addMessage(
          "Sorry, I'm having trouble connecting to the brain right now.",
          "ai"
        );
      } finally {
        loadingIndicator.style.display = "none";
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
        scrollToBottom();
      }
    }

    sendBtn.addEventListener("click", handleSend);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSend();
    });
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
