function showFloatingUI(original, enhanced) {
  const existing = document.getElementById("prompt-enhancer-popup");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "prompt-enhancer-popup";

  container.innerHTML = `
    <div id="popup-header">
      <strong>Enhanced Prompt</strong>
      <span id="close-icon" title="Close">✖</span>
    </div>
    <pre id="enhanced-text">${enhanced}</pre>
     <div id="popup-actions">
      <span id="regenerate-icon" title="Regenerate">🔁</span>
      <span id="copy-icon" title="Copy to clipboard">📋</span>
    </div>
  `;

  document.body.appendChild(container);

  // Close icon
  document.getElementById("close-icon").onclick = () => {
    container.remove();
  };

  // Copy icon
  document.getElementById("copy-icon").onclick = () => {
    const text = document.getElementById("enhanced-text").innerText;
    navigator.clipboard.writeText(text).then(() => {
      document.getElementById("copy-icon").textContent = "✅";
      setTimeout(() => {
        document.getElementById("copy-icon").textContent = "📋";
      }, 1000);
    });
  };

  // Regenerate icon
  document.getElementById("regenerate-icon").onclick = () => {
    document.getElementById("enhanced-text").textContent = "⏳ Regenerating...";
    chrome.runtime.sendMessage({
      type: "REGENERATE_PROMPT",
      original: original,
    });
  };

  container.style.cursor = "move";
  let offsetX, offsetY;

  container.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;

    const onMouseMove = (e) => {
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
      container.style.bottom = "unset";
      container.style.right = "unset";
      container.style.position = "fixed";
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

// Detect selection
document.addEventListener("mouseup", async () => {
  const selection = window.getSelection().toString().trim();
  if (selection.startsWith("Prompt:")) {
    chrome.runtime.sendMessage({ type: "ENHANCE_PROMPT", prompt: selection });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_UI") {
    console.log("📬 Received enhanced prompt:", msg);
    showFloatingUI(msg.original, msg.enhanced);
  }
});
