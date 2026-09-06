import QRCode from "qrcode";
import { fileURLToPath } from "node:url";

const siteUrl = "https://lugano-clothing.g74447590.workers.dev";
const outputPath = fileURLToPath(new URL("../public/lugano-qrcode.png", import.meta.url));

await QRCode.toFile(outputPath, siteUrl, {
  width: 1024,
  margin: 4,
  errorCorrectionLevel: "H",
  color: {
    dark: "#0B1520",
    light: "#FFFFFF",
  },
});

console.log(`QR code criado em ${outputPath}`);
