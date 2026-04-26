(function () {
  if (window.__axcellWidgetLoaded) {
    return;
  }

  window.__axcellWidgetLoaded = true;

  const script = document.currentScript;
  const baseUrl = script ? new URL(script.src).origin : window.location.origin;
  const widgetKey = script
    ? script.getAttribute("data-widget-key") || ""
    : "";

  const styles = document.createElement("style");
  styles.textContent = `
    .axcell-widget-button {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483647;
      border: 0;
      border-radius: 999px;
      background: #ffffff;
      color: #000000;
      padding: 14px 18px;
      font: 600 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
      cursor: pointer;
    }

    .axcell-widget-panel {
      position: fixed;
      right: 24px;
      bottom: 84px;
      z-index: 2147483647;
      display: none;
      width: min(360px, calc(100vw - 32px));
      background: #18181b;
      color: #ffffff;
      border-radius: 14px;
      padding: 18px;
      box-shadow: 0 22px 60px rgba(0, 0, 0, 0.45);
      font: 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .axcell-widget-panel.axcell-widget-open {
      display: block;
    }

    .axcell-widget-title {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 700;
    }

    .axcell-widget-subtitle {
      margin: 0 0 14px;
      color: #a1a1aa;
      font-size: 13px;
    }

    .axcell-widget-messages {
      height: 190px;
      overflow-y: auto;
      background: #000000;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .axcell-widget-empty {
      color: #71717a;
      margin: 0;
    }

    .axcell-widget-message {
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 8px;
      line-height: 1.4;
      white-space: pre-wrap;
    }

    .axcell-widget-message-customer {
      margin-left: 30px;
      background: #ffffff;
      color: #000000;
    }

    .axcell-widget-message-bot {
      margin-right: 30px;
      background: #27272a;
      color: #f4f4f5;
    }

    .axcell-widget-input {
      box-sizing: border-box;
      width: 100%;
      border: 0;
      border-radius: 10px;
      background: #27272a;
      color: #ffffff;
      padding: 11px;
      margin-bottom: 10px;
      font: inherit;
    }

    .axcell-widget-row {
      display: flex;
      gap: 10px;
    }

    .axcell-widget-row .axcell-widget-input {
      min-width: 0;
      flex: 1;
      margin-bottom: 0;
    }

    .axcell-widget-send {
      border: 0;
      border-radius: 10px;
      background: #ffffff;
      color: #000000;
      padding: 0 16px;
      font: 700 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      cursor: pointer;
    }

    .axcell-widget-send:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  `;
  document.head.appendChild(styles);

  const panel = document.createElement("div");
  panel.className = "axcell-widget-panel";
  panel.innerHTML = `
    <h2 class="axcell-widget-title">Axcell Chat</h2>
    <p class="axcell-widget-subtitle">Send us a message.</p>
    <div class="axcell-widget-messages">
      <p class="axcell-widget-empty">No messages yet.</p>
    </div>
    <form class="axcell-widget-form">
      <input class="axcell-widget-input axcell-widget-name" placeholder="Your name" />
      <input class="axcell-widget-input axcell-widget-email" placeholder="Your email" type="email" />
      <div class="axcell-widget-row">
        <input class="axcell-widget-input axcell-widget-text" placeholder="Message" />
        <button class="axcell-widget-send" type="submit">Send</button>
      </div>
    </form>
  `;

  const button = document.createElement("button");
  button.className = "axcell-widget-button";
  button.type = "button";
  button.textContent = "Chat";

  document.body.appendChild(panel);
  document.body.appendChild(button);

  const messages = panel.querySelector(".axcell-widget-messages");
  const form = panel.querySelector(".axcell-widget-form");
  const nameInput = panel.querySelector(".axcell-widget-name");
  const emailInput = panel.querySelector(".axcell-widget-email");
  const textInput = panel.querySelector(".axcell-widget-text");
  const sendButton = panel.querySelector(".axcell-widget-send");

  function addMessage(role, text) {
    const empty = messages.querySelector(".axcell-widget-empty");

    if (empty) {
      empty.remove();
    }

    const message = document.createElement("div");
    message.className =
      role === "customer"
        ? "axcell-widget-message axcell-widget-message-customer"
        : "axcell-widget-message axcell-widget-message-bot";
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  button.addEventListener("click", function () {
    panel.classList.toggle("axcell-widget-open");
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const customerName = nameInput.value.trim();
    const customerEmail = emailInput.value.trim();
    const text = textInput.value.trim();

    if (!customerName || !text) {
      return;
    }

    addMessage("customer", text);
    textInput.value = "";
    sendButton.disabled = true;
    sendButton.textContent = "Sending";

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          widget_key: widgetKey,
          customer_name: customerName,
          customer_email: customerEmail || null,
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addMessage("bot", data.error || "Could not send message.");
        return;
      }

      addMessage("bot", data.reply);
    } catch {
      addMessage("bot", "Could not send message.");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Send";
    }
  });
})();
