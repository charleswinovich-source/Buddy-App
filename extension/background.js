// Vibetran Buddy — Background Service Worker
// Manages badge state on the extension toolbar icon

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SET_BADGE') {
    chrome.action.setBadgeText({ text: msg.count > 0 ? String(msg.count) : '', tabId: sender.tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#C8F031' });
  }
  if (msg.type === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '', tabId: sender.tab.id });
  }
});

// When toolbar icon is clicked, toggle the panel in the content script
chrome.action.onClicked.addListener((tab) => {
  if (tab.id && !tab.url?.startsWith('chrome://')) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' }).catch(() => {});
  }
});
