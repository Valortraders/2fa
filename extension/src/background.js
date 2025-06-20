// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize storage with default values
    chrome.storage.sync.set({
      theme: 'dark',
      secrets: []
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TOTP') {
    const { secret } = message;
    // Generate TOTP code
    // We'll implement this in the next step
    sendResponse({ success: true });
  }
}); 