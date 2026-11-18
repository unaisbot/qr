
const input = document.getElementById("documentId");
const urlDisplay = document.getElementById("verificationUrl");
const qrContainer = document.getElementById("qrContainer");
const downloadBtn = document.getElementById("downloadBtn");
const message = document.getElementById("message");

let qrCode = null;
let currentUrl = "";

const verificationBase =
  "https://verify.tbarc.in/verify/?id=";

input.addEventListener("input", () => {
  const id = input.value.trim();

  qrContainer.innerHTML = "";
  message.textContent = "";
  downloadBtn.disabled = true;
  qrCode = null;
  currentUrl = "";

  if (!id) {
    urlDisplay.textContent =
      "Enter a document ID to generate the URL.";
    return;
  }

  currentUrl = verificationBase + encodeURIComponent(id);
  urlDisplay.textContent = currentUrl;

  const qrBox = document.createElement("div");
  qrContainer.appendChild(qrBox);

  qrCode = new QRCode(qrBox, {
    text: currentUrl,
    width: 220,
    height: 220,
    colorDark: "#174d35",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  downloadBtn.disabled = false;
});

downloadBtn.addEventListener("click", () => {
  if (!qrCode || !currentUrl) return;

  const canvas = qrContainer.querySelector("canvas");
  const image = qrContainer.querySelector("img");

  let dataUrl = canvas
    ? canvas.toDataURL("image/png")
    : image?.src;

  if (!dataUrl) {
    message.textContent = "QR code is not ready.";
    return;
  }

  const link = document.createElement("a");
  const id = input.value.trim();

  link.href = dataUrl;
  link.download = id + "-QR.png";
  link.click();

  message.textContent = "QR code downloaded successfully.";
});
