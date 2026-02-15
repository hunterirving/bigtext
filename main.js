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
  text.innerHTML = val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  display.classList.toggle("empty", !val);
  fitText();
});

function updateDisplaySize() {
  const vv = window.visualViewport;
  if (vv) {
    display.style.width = vv.width + "px";
    display.style.height = vv.height + "px";
  }
}

function fitText() {
  updateDisplaySize();

  if (!text.textContent) {
    text.style.fontSize = "";
    text.style.width = "";
    text.style.height = "";
    return;
  }

  const pad = 24;
  const vv = window.visualViewport;
  const maxW = (vv ? vv.width : window.innerWidth) - pad;
  const maxH = (vv ? vv.height : window.innerHeight) - pad;

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

    // Check if wrapped text fits in height
    const heightFits = text.scrollHeight <= maxH;

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
}

focusInput();
