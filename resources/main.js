const display = document.getElementById("display");
const text = document.getElementById("text");
const input = document.getElementById("input");

// Hidden element for measuring individual word widths
const wordProbe = document.createElement("div");
wordProbe.style.cssText =
  "position:absolute;left:-9999px;top:-9999px;visibility:hidden;" +
  "white-space:nowrap;font-family:sans-serif;font-weight:bold;line-height:1.1;";
document.body.appendChild(wordProbe);

function focusInput() {
  input.focus();
}

document.body.addEventListener("click", focusInput);
document.body.addEventListener("touchstart", focusInput);

input.addEventListener("input", () => {
  const val = input.value;
  text.textContent = val.replace(/\n/g, " ");
  display.classList.toggle("empty", !val);
  fitText();
});

function getViewport() {
  const vv = window.visualViewport;
  // Use the smallest available height to account for on-screen keyboard
  const vvW = vv ? vv.width : window.innerWidth;
  const vvH = vv ? vv.height : window.innerHeight;
  return {
    width: Math.min(vvW, window.innerWidth),
    height: Math.min(vvH, window.innerHeight),
    offsetTop: vv ? vv.offsetTop : 0,
  };
}

function updateDisplaySize() {
  const vp = getViewport();
  display.style.width = vp.width + "px";
  display.style.height = vp.height + "px";
  display.style.top = vp.offsetTop + "px";
}

function fitText() {
  updateDisplaySize();

  if (!text.textContent) {
    text.style.fontSize = "";
    text.style.width = "";
    text.style.height = "";
    return;
  }

  const pad = 12;
  const vp = getViewport();
  const maxW = vp.width - pad;
  const maxH = vp.height - pad;

  // Constrain the text element to available space
  text.style.width = maxW + "px";
  text.style.height = maxH + "px";
  text.style.overflow = "hidden";

  // Get all words (split on whitespace)
  const words = text.textContent.split(/\s+/).filter(Boolean);

  // Binary search for the largest font size that fits
  let lo = 1;
  let hi = Math.max(maxW, maxH);

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    text.style.fontSize = mid + "px";
    wordProbe.style.fontSize = mid + "px";

    // Check every word fits within maxW using the hidden nowrap probe
    let wordsFit = true;
    for (const word of words) {
      wordProbe.textContent = word;
      if (wordProbe.offsetWidth > maxW) {
        wordsFit = false;
        break;
      }
    }

    // Remove height constraint to measure true content height
    text.style.height = "auto";
    const heightFits = text.scrollHeight <= maxH;
    text.style.height = maxH + "px";

    if (wordsFit && heightFits) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  text.style.fontSize = lo + "px";
  text.style.overflow = "";
}

window.addEventListener("resize", fitText);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", fitText);
  window.visualViewport.addEventListener("scroll", updateDisplaySize);
}

// Prevent pinch-to-zoom and double-tap zoom on Android
document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

document.addEventListener("touchstart", (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

focusInput();
