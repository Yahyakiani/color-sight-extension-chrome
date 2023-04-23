// Get references to UI elements
const profileSelect = document.getElementById('colorblindness-profile');
const toggleButton = document.getElementById('toggle-extension');

// Load user preferences from Chrome storage and set UI state
chrome.storage.sync.get(['colorblindProfile', 'isEnabled'], (data) => {
  profileSelect.value = data.colorblindProfile || 'protanopia';
  toggleButton.textContent = data.isEnabled ? 'Disable Colorblind Mode' : 'Enable Colorblind Mode';
});

// Listen for changes in the colorblindness profile selection
profileSelect.addEventListener('change', (event) => {
    const selectedProfile = event.target.value;
    chrome.storage.sync.set({ colorblindProfile: selectedProfile });
  
    // Send a message to the content script to apply the color adjustments
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyColorAdjustments',
        colorblindProfile: selectedProfile,
      });
    });
  });
  

// Listen for clicks on the toggle button
toggleButton.addEventListener('click', () => {
  // Toggle the extension's enabled state
  chrome.storage.sync.get('isEnabled', (data) => {
    const isEnabled = !data.isEnabled;
    chrome.storage.sync.set({ isEnabled });

    // Update the button text
    toggleButton.textContent = isEnabled ? 'Disable Colorblind Mode' : 'Enable Colorblind Mode';

    // Send a message to the content script to enable/disable color adjustments
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleColorblindMode',
        isEnabled,
      });
    });
  });
});
