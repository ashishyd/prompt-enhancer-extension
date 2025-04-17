// Display the last enhanced prompt
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['lastEnhanced'], result => {
        document.getElementById('enhanced').textContent = result.lastEnhanced || 'No prompt enhanced yet.';
    });
    document.getElementById('settingsBtn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});