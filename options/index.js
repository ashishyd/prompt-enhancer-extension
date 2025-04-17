const input = document.getElementById("key");
chrome.storage.sync.get(
  "openaiApiKey",
  (res) => (input.value = res.openaiApiKey || ""),
);
document.getElementById("save").onclick = () => {
  chrome.storage.sync.set({ openaiApiKey: input.value }, () => alert("Saved!"));
};
