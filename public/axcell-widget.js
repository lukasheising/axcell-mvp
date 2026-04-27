(function () {
  if (window.__AXCELL_WIDGET_LOADED__) return;
  window.__AXCELL_WIDGET_LOADED__ = true;

  function injectWidget() {
    if (document.getElementById("axcell-widget-button")) return;

    var box = document.createElement("div");
    box.id = "axcell-widget-box";
    box.style.display = "none";
    box.style.position = "fixed";
    box.style.right = "20px";
    box.style.bottom = "80px";
    box.style.width = "320px";
    box.style.height = "420px";
    box.style.background = "#111";
    box.style.color = "#fff";
    box.style.border = "1px solid #333";
    box.style.borderRadius = "18px";
    box.style.zIndex = "999999";
    box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
    box.style.overflow = "hidden";
    box.style.fontFamily = "Arial, sans-serif";

    box.innerHTML =
      "<div style='padding:16px;border-bottom:1px solid #333;'>" +
      "<strong>Axcell Support</strong>" +
      "</div>" +
      "<div id='axcell-widget-messages' style='height:285px;padding:16px;overflow-y:auto;font-size:14px;color:#ddd;'>" +
      "<div style='margin-bottom:10px;'>Hej 👋 Hvordan kan vi hjælpe?</div>" +
      "</div>" +
      "<div style='display:flex;gap:8px;padding:12px;border-top:1px solid #333;'>" +
      "<input id='axcell-widget-input' placeholder='Skriv her...' style='flex:1;background:#000;color:#fff;border:1px solid #333;border-radius:999px;padding:10px;font-size:14px;outline:none;' />" +
      "<button id='axcell-widget-send' style='background:#fff;color:#000;border:none;border-radius:999px;padding:10px 14px;font-size:14px;cursor:pointer;'>Send</button>" +
      "</div>";

    var button = document.createElement("button");
    button.id = "axcell-widget-button";
    button.innerText = "Chat med os";
    button.style.position = "fixed";
    button.style.right = "20px";
    button.style.bottom = "20px";
    button.style.zIndex = "999999";
    button.style.background = "#000";
    button.style.color = "#fff";
    button.style.border = "1px solid #333";
    button.style.borderRadius = "999px";
    button.style.padding = "14px 18px";
    button.style.fontSize = "14px";
    button.style.cursor = "pointer";

    button.onclick = function () {
      box.style.display = box.style.display === "none" ? "block" : "none";
    };

    document.body.appendChild(box);
    document.body.appendChild(button);

    var input = document.getElementById("axcell-widget-input");
    var send = document.getElementById("axcell-widget-send");
    var messages = document.getElementById("axcell-widget-messages");

    async function sendMessage() {
      var text = input.value.trim();
      if (!text) return;

      var userMessage = document.createElement("div");
      userMessage.style.marginBottom = "10px";
      userMessage.style.textAlign = "right";
      userMessage.innerText = text;
      messages.appendChild(userMessage);

      input.value = "";

      var botMessage = document.createElement("div");
      botMessage.style.marginBottom = "10px";
      botMessage.style.color = "#aaa";
      botMessage.innerText = "Sender...";
      messages.appendChild(botMessage);

      messages.scrollTop = messages.scrollHeight;

      try {
        var response = await fetch(
          "https://axcell-mvp-git-main-lukasheising-8122s-projects.vercel.app/api/chat",
          {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
          }
        );
        var data = await response.json();

        botMessage.innerText = data.reply || "Der opstod en fejl. Prøv igen.";
      } catch {
        botMessage.innerText = "Der opstod en fejl. Prøv igen.";
      }

      messages.scrollTop = messages.scrollHeight;
    }

    send.onclick = sendMessage;

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectWidget);
  } else {
    injectWidget();
  }
})();
