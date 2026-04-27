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
    box.style.padding = "16px";
    box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
    box.innerHTML =
      "<h3 style='margin:0 0 12px;font-size:16px;'>Axcell Support</h3>" +
      "<p style='font-size:14px;color:#ccc;'>Hej 👋 Hvordan kan vi hjælpe?</p>";

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectWidget);
  } else {
    injectWidget();
  }
})();