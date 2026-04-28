(function () {
  if (window.__AXCELL_WIDGET_LOADED__) return;
  window.__AXCELL_WIDGET_LOADED__ = true;

  var widgetScript = document.currentScript;
  var widgetKey = widgetScript
    ? (widgetScript.getAttribute("data-widget-key") || "").trim()
    : "";
  var apiUrl =
    (widgetScript && widgetScript.getAttribute("data-api-url")) ||
    (widgetScript && widgetScript.src
      ? new URL("/api/chat", widgetScript.src).toString()
      : "/api/chat");
  var requestTypes = [
    "Price request",
    "Booking request",
    "Existing customer request",
  ];

  function injectWidget() {
    if (document.getElementById("axcell-widget-button")) return;

    var box = document.createElement("div");
    box.id = "axcell-widget-box";
    box.style.display = "none";
    box.style.position = "fixed";
    box.style.right = "20px";
    box.style.bottom = "80px";
    box.style.width = "340px";
    box.style.height = "560px";
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
      "<strong>Axcell Window Cleaning</strong>" +
      "</div>" +
      "<div id='axcell-widget-messages' style='height:110px;padding:16px;overflow-y:auto;font-size:14px;color:#ddd;'>" +
      "<div style='margin-bottom:10px;'>Hi. Send a quote, booking, or existing customer request.</div>" +
      "</div>" +
      "<div style='display:flex;flex-direction:column;gap:8px;padding:12px;border-top:1px solid #333;'>" +
      "<select id='axcell-widget-request-type' style='background:#000;color:#fff;border:1px solid #333;border-radius:10px;padding:10px;font-size:14px;outline:none;'>" +
      requestTypes
        .map(function (type) {
          return "<option value='" + type + "'>" + type + "</option>";
        })
        .join("") +
      "</select>" +
      "<input id='axcell-widget-name' placeholder='Name' style='background:#000;color:#fff;border:1px solid #333;border-radius:10px;padding:10px;font-size:14px;outline:none;' />" +
      "<input id='axcell-widget-phone' placeholder='Phone' style='background:#000;color:#fff;border:1px solid #333;border-radius:10px;padding:10px;font-size:14px;outline:none;' />" +
      "<input id='axcell-widget-address' placeholder='Address' style='background:#000;color:#fff;border:1px solid #333;border-radius:10px;padding:10px;font-size:14px;outline:none;' />" +
      "<textarea id='axcell-widget-input' placeholder='How can we help?' style='height:82px;background:#000;color:#fff;border:1px solid #333;border-radius:10px;padding:10px;font-size:14px;outline:none;resize:none;'></textarea>" +
      "<button id='axcell-widget-send' style='background:#fff;color:#000;border:none;border-radius:999px;padding:10px 14px;font-size:14px;cursor:pointer;'>Send request</button>" +
      "</div>";

    var button = document.createElement("button");
    button.id = "axcell-widget-button";
    button.innerText = "Request window cleaning";
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
    var requestType = document.getElementById("axcell-widget-request-type");
    var name = document.getElementById("axcell-widget-name");
    var phone = document.getElementById("axcell-widget-phone");
    var address = document.getElementById("axcell-widget-address");
    var send = document.getElementById("axcell-widget-send");
    var messages = document.getElementById("axcell-widget-messages");

    async function sendMessage() {
      var text = input.value.trim();
      if (!text) return;

      var userMessage = document.createElement("div");
      userMessage.style.marginBottom = "10px";
      userMessage.style.textAlign = "right";
      userMessage.innerText = requestType.value + ": " + text;
      messages.appendChild(userMessage);

      input.value = "";

      var botMessage = document.createElement("div");
      botMessage.style.marginBottom = "10px";
      botMessage.style.color = "#aaa";
      botMessage.innerText = "Sender...";
      messages.appendChild(botMessage);

      messages.scrollTop = messages.scrollHeight;

      try {
        if (!widgetKey || widgetKey === "PASTE_WIDGET_KEY_HERE") {
          throw new Error("Widget key is missing.");
        }

        var response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: "widget_intake",
            widget_key: widgetKey,
            request_type: requestType.value,
            customer_name: name.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim(),
            message: text,
          }),
        });
        var data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Request was not saved.");
        }

        botMessage.innerText =
          data.reply || "Thanks. We received your request and will follow up.";
      } catch (error) {
        botMessage.innerText =
          error && error.message
            ? error.message
            : "Something went wrong. Please try again.";
      }

      messages.scrollTop = messages.scrollHeight;
    }

    send.onclick = sendMessage;

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
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
