const PIX_BASE_PAYLOAD = "00020101021126580014br.gov.bcb.pix0136254af39f-157a-4c72-ad90-95d0f49cf9bf5204000053039865802BR5922GABRIEL ALVES FERREIRA6008BRASILIA62070503***63042066";

function crc16(value: string) {
  let crc = 0xffff;
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function createPixPayload(totalCents: number) {
  const payloadWithoutCrc = PIX_BASE_PAYLOAD.slice(0, PIX_BASE_PAYLOAD.lastIndexOf("6304"));
  const amount = (totalCents / 100).toFixed(2);
  const amountField = `54${amount.length.toString().padStart(2, "0")}${amount}`;
  const countryFieldIndex = payloadWithoutCrc.indexOf("58");
  const payloadWithAmount = `${payloadWithoutCrc.slice(0, countryFieldIndex)}${amountField}${payloadWithoutCrc.slice(countryFieldIndex)}6304`;
  return `${payloadWithAmount}${crc16(payloadWithAmount)}`;
}
