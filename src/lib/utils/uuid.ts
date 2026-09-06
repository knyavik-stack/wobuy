import crypto from "crypto";

/**
 * Проверяет, является ли строка валидным UUID
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Генерирует детерминированный RFC 4122 v5 UUID из любой строки или ключа.
 * Для одного и того же ключа результат ВСЕГДА идентичен на любом сервере.
 */
export function deterministicUuid(input: string): string {
  if (isValidUuid(input)) {
    return input.toLowerCase();
  }

  const hash = crypto.createHash("sha1").update("wobuy:" + input).digest("hex");
  const p1 = hash.substring(0, 8);
  const p2 = hash.substring(8, 12);
  const p3 = "5" + hash.substring(13, 16);
  const p4 =
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") +
    hash.substring(18, 20);
  const p5 = hash.substring(20, 32);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`.toLowerCase();
}
