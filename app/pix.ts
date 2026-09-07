export type PixConfig = {
  key: string;
  receiverName: string;
  receiverCity: string;
};

function crc16(value: string) {
  let crc = 0xffff;
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function field(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function normalizeMerchantValue(value: string, maxLength: number) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9 $%*+\-./:]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizePixKey(value: string) {
  const key = value.trim();
  return /^\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}$/.test(key) ? key.replace(/\D/g, "") : key;
}

export function getPixConfig(value: Partial<PixConfig>): PixConfig | null {
  const key = normalizePixKey(value.key ?? "");
  const receiverName = normalizeMerchantValue(value.receiverName ?? "", 25);
  const receiverCity = normalizeMerchantValue(value.receiverCity ?? "", 15);
  return key && receiverName && receiverCity ? { key, receiverName, receiverCity } : null;
}

export function createPixPayload(totalCents: number, config: PixConfig, transactionId: string) {
  const amount = (totalCents / 100).toFixed(2);
  const txid = normalizeMerchantValue(transactionId, 25) || "***";
  const merchantAccount = field("00", "br.gov.bcb.pix") + field("01", config.key);
  const payloadWithoutCrc = [
    "000201010211",
    field("26", merchantAccount),
    "52040000",
    "5303986",
    field("54", amount),
    "5802BR",
    field("59", config.receiverName),
    field("60", config.receiverCity),
    field("62", field("05", txid)),
    "6304",
  ].join("");
  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}
