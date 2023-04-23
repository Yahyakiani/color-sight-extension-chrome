// Helper function to convert an sRGB color component to linear color space
function srgbToLinear(c) {
  if (c <= 0.04045) {
    return c / 12.92;
  } else {
    return Math.pow((c + 0.055) / 1.055, 2.4);
  }
}

// Helper function to convert a linear color component to sRGB color space
function linearToSrgb(c) {
  if (c <= 0.0031308) {
    return c * 12.92;
  } else {
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
}

// Store original colors for restoring later
const originalColors = new WeakMap();

// Function to apply color adjustments based on the selected colorblindness profile
function applyColorAdjustments(profile) {
  const colorMatrixMap = {
    'protanopia': [
      0.567, 0.433, 0,
      0.558, 0.442, 0,
      0, 0.242, 0.758
    ],
    'deuteranopia': [
      0.625, 0.375, 0,
      0.7, 0.3, 0,
      0, 0.3, 0.7
    ],
    'tritanopia': [
      0.95, 0.05, 0,
      0, 0.433, 0.567,
      0, 0.475, 0.525
    ]
  };

  const colorMatrix = colorMatrixMap[profile];

  if (!colorMatrix) {
    return;
  }

  const elements = document.querySelectorAll('*');

  for (const el of elements) {
    // Save the original color as a CSS custom property if it's not already saved
    if (!originalColors.has(el)) {
      originalColors.set(el, getComputedStyle(el).color);
    }

    const color = originalColors.get(el);
    if (color && color.match) {
      console.log(color)
      const [r, g, b] = color.match(/\d+/g).map(Number);

      const linearR = srgbToLinear(r / 255);
      const linearG = srgbToLinear(g / 255);
      const linearB = srgbToLinear(b / 255);

      const newR = linearToSrgb(colorMatrix[0] * linearR + colorMatrix[1] * linearG + colorMatrix[2] * linearB);
      const newG = linearToSrgb(colorMatrix[3] * linearR + colorMatrix[4] * linearG + colorMatrix[5] * linearB);
      const newB = linearToSrgb(colorMatrix[6] * linearR + colorMatrix[7] * linearG + colorMatrix[8] * linearB);

      el.style.color = `rgb(${Math.round(newR * 255)}, ${Math.round(newG * 255)}, ${Math.round(newB * 255)})`;
    }
  }
}

// Function to remove color adjustments and restore original colors
function removeColorAdjustments() {
  const elements = document.querySelectorAll('*');

  for (const el of elements) {
    const originalColor = originalColors.get(el);
    if (originalColor) {
      el.style.color = originalColor;
      originalColors.delete(el);
    }
  }
}
  
// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('1');
  if (request.action === 'applyColorAdjustments') {
    applyColorAdjustments(request.colorblindProfile);
  } else if (request.action === 'removeColorAdjustments') {
    removeColorAdjustments();
  } else if (request.action === 'toggleColorblindMode') {
    if (request.isEnabled) {
      chrome.storage.sync.get('colorblindProfile', (data) => {
        applyColorAdjustments(data.colorblindProfile);
      });
    } else {
      removeColorAdjustments();
    }
  }
});
