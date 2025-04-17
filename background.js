chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "enhance_prompt",
    title: "Enhance Prompt",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "enhance_prompt") {
    handleEnhancement(info.selectionText);
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ENHANCE_PROMPT") {
    handleEnhancement(msg.prompt);
  }
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "REGENERATE_PROMPT") {
    const enhanced = await enhancePromptWithAI(msg.original);
    chrome.tabs.sendMessage(sender.tab.id, {
      type: "SHOW_UI",
      original: msg.original,
      enhanced: enhanced,
    });
  }
});

async function handleEnhancement(prompt) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error("❌ Missing OpenAI API key.");
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Improve this prompt for better AI results.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ OpenAI Error:", data.error.message);
      return;
    }

    const enhanced = data.choices?.[0]?.message?.content?.trim();
    if (!enhanced) {
      console.error("❌ No enhanced prompt returned.");
      return;
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tabs.length === 0 || !tabs[0].id) {
      console.error("❌ No active tab found.");
      return;
    }

    const tabId = tabs[0].id;

    chrome.tabs.sendMessage(tabId, {
      type: "SHOW_UI",
      original: prompt,
      enhanced,
    });
  } catch (err) {
    if (chrome.runtime.lastError) {
      console.error(
        "❌ Failed to send message to content script:",
        chrome.runtime.lastError.message,
      );
    } else {
      console.log("✅ Message sent to content script");
    }
  }
}

function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("openaiApiKey", (res) => resolve(res.openaiApiKey));
  });
}
