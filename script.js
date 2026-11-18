const $ = (id) => document.getElementById(id);

const contentType = $("contentType");
const mainContent = $("mainContent");
const contentLabel = $("contentLabel");
const contentHelp = $("contentHelp");
const qrContainer = $("qrPreview");
const statusMessage = $("statusMessage");
const logoUpload = $("logoUpload");
const logoActions = $("logoActions");
const logoName = $("logoName");
let logoData = null;
let originalLogoData = null;
let qrCode = null;
let updateTimer = null;

const fieldConfig = {
  url:   ["Website address", "https://example.com", "Include https:// for the best compatibility."],
  text:  ["Your text", "Enter any text you want to share", "The QR code will display this text when scanned."],
  email:["Email address", "hello@example.com", "Creates an email link. You can add a subject and message in the format below."],
  phone:["Phone number", "+911234567890", "Include the country code, for example +91."],
  sms:  ["Phone number and message", "+911234567890 | Hello!", "Enter the number, then a vertical bar |, then your message."],
  wifi: ["Wi-Fi details", "Network name | Password | WPA", "Format: network name | password | security. Security can be WPA, WEP or nopass."]
};

function payloadFromInput() {
  const type = contentType.value;
  const value = mainContent.value.trim();
  if (!value) return "";
  if (type === "url") return value;
  if (type === "text") return value;
  if (type === "email") {
    const parts = value.split("|").map(v => v.trim());
    const address = parts[0] || "";
    const subject = parts[1] || "";
    const body = parts[2] || "";
    return `mailto:${address}${subject || body ? `?${subject ? `subject=${encodeURIComponent(subject)}` : ""}${subject && body ? "&" : ""}${body ? `body=${encodeURIComponent(body)}` : ""}` : ""}`;
  }
  if (type === "phone") return `tel:${value.replace(/\s+/g, "")}`;
  if (type === "sms") {
    const [number, message = ""] = value.split("|").map(v => v.trim());
    return `SMSTO:${number}:${message}`;
  }
  if (type === "wifi") {
    const [ssid = "", password = "", security = "WPA"] = value.split("|").map(v => v.trim());
    const safe = s => s.replace(/([\\;,:"])/g, "\\$1");
    return `WIFI:T:${security.toUpperCase()};S:${safe(ssid)};P:${safe(password)};;`;
  }
  return value;
}

function currentOptions(data) {
  const fg = $("foreground").value;
  const bg = $("background").value;
  const dotType = $("dotStyle").value;
  const cornerType = $("cornerStyle").value;
  return {
    width: 1000,
    height: 1000,
    type: "svg",
    data,
    margin: 18,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { color: fg, type: dotType },
    backgroundOptions: { color: bg },
    cornersSquareOptions: { color: fg, type: cornerType },
    cornersDotOptions: { color: fg, type: "dot" },
    image: logoData || undefined,
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 8,
      imageSize: 0.23,
      hideBackgroundDots: true
    }
  };
}

function renderQR() {
  const data = payloadFromInput();
  if (!data) {
    qrContainer.innerHTML = '<div class="empty-preview">Your QR code<br>will appear here</div>';
    statusMessage.textContent = "Enter your content to create a QR code.";
    return;
  }
  if (typeof QRCodeStyling === "undefined") {
    statusMessage.textContent = "QR library could not load. Check your internet connection and refresh.";
    return;
  }
  try {
    qrContainer.innerHTML = "";
    qrCode = new QRCodeStyling(currentOptions(data));
    qrCode.append(qrContainer);
    statusMessage.textContent = "QR code updated. Scan it to check the content before downloading.";
  } catch (error) {
    statusMessage.textContent = "Could not generate this QR code. Please check your content.";
    console.error(error);
  }
}

function scheduleRender() {
  clearTimeout(updateTimer);
  updateTimer = setTimeout(renderQR, 180);
}

function updateContentFields() {
  const config = fieldConfig[contentType.value];
  contentLabel.textContent = config[0];
  mainContent.placeholder = config[1];
  contentHelp.textContent = config[2];
  mainContent.value = "";
  scheduleRender();
}

function bindColor(colorId, hexId) {
  const color = $(colorId);
  const hex = $(hexId);
  color.addEventListener("input", () => { hex.value = color.value.toUpperCase(); scheduleRender(); });
  hex.addEventListener("change", () => {
    const value = hex.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      color.value = value;
      hex.value = value.toUpperCase();
      scheduleRender();
    } else {
      hex.value = color.value.toUpperCase();
    }
  });
}

function download(extension) {
  if (!payloadFromInput()) {
    statusMessage.textContent = "Enter some content before downloading.";
    mainContent.focus();
    return;
  }
  if (!qrCode) {
    renderQR();
  }
  if (qrCode) {
    qrCode.download({ name: "qr-code", extension });
  }
}

contentType.addEventListener("change", updateContentFields);
mainContent.addEventListener("input", scheduleRender);
["dotStyle", "cornerStyle"].forEach(id => $(id).addEventListener("change", scheduleRender));
$("logoBackdrop").addEventListener("change", async () => {
  if (originalLogoData) {
    logoData = await prepareLogo(originalLogoData, $("logoBackdrop").checked);
    scheduleRender();
  }
});

function prepareLogo(dataUrl, addBacking) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      const scale = 0.78;
      const size = 512 * scale;
      const x = (512 - size) / 2;
      const y = (512 - size) / 2;
      if (addBacking) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(256, 256, 250, 0, Math.PI * 2);
        ctx.fill();
      }
      const ratio = Math.min(size / img.width, size / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, 256 - w / 2, 256 - h / 2, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
bindColor("foreground", "foregroundHex");
bindColor("background", "backgroundHex");

logoUpload.addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    statusMessage.textContent = "Please choose a PNG, JPG or WEBP image.";
    logoUpload.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    statusMessage.textContent = "Please choose a logo smaller than 5 MB.";
    logoUpload.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    originalLogoData = reader.result;
    prepareLogo(originalLogoData, $("logoBackdrop").checked).then(prepared => {
      logoData = prepared;
      logoName.textContent = file.name;
      logoActions.hidden = false;
      scheduleRender();
    });
  };
  reader.readAsDataURL(file);
});

$("removeLogo").addEventListener("click", () => {
  logoData = null;
  originalLogoData = null;
  logoUpload.value = "";
  logoActions.hidden = true;
  scheduleRender();
});
$("downloadPng").addEventListener("click", () => download("png"));
$("downloadSvg").addEventListener("click", () => download("svg"));

renderQR();
