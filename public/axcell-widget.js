(function () {
  if (window.__AXCELL_WIDGET_LOADED__) return;
  window.__AXCELL_WIDGET_LOADED__ = true;

  function injectWidget() {
    try {
      if (document.getElementById("axcell-widget-button")) return;

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
      button.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";

      document.body.appendChild(button);

      console.log("Axcell widget loaded");
    } catch (error) {
      console.error("Axcell widget failed to inject", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectWidget);
  } else {
    injectWidget();
  }
})();