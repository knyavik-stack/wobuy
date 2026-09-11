/**
 * Стандарт безопасности паролей wobuy.
 * Требования:
 * - Минимум 8 символов
 * - Только латиница (a-z, A-Z), цифры (0-9) и безопасные спецсимволы
 * - Обязательно минимум 1 заглавная буква
 * - Обязательно минимум 1 строчная буква
 * - Обязательно минимум 1 цифра
 */

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  isLatinOnly: boolean;
  hasNoSpaces: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0..100
  criteria: PasswordCriteria;
  errorMessage: string | null;
}

// Разрешённые символы: латиница, цифры и стандартные спецсимволы
const LATIN_AND_SYMBOLS_REGEX = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/;
const CYRILLIC_REGEX = /[\u0400-\u04FF]/;

export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      criteria: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        isLatinOnly: false,
        hasNoSpaces: false,
      },
      errorMessage: "Введите пароль.",
    };
  }

  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasNoCyrillic = !CYRILLIC_REGEX.test(password);
  const isLatinOnly = hasNoCyrillic && LATIN_AND_SYMBOLS_REGEX.test(password);
  const hasNoSpaces = !/\s/.test(password);

  const criteria: PasswordCriteria = {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    isLatinOnly,
    hasNoSpaces,
  };

  // Расчет прогресса надежности пароля
  let score = 0;
  if (minLength) score += 25;
  if (hasUpper) score += 20;
  if (hasLower) score += 20;
  if (hasNumber) score += 20;
  if (isLatinOnly && hasNoSpaces) score += 15;

  let errorMessage: string | null = null;
  if (!hasNoCyrillic) {
    errorMessage = "Пароль должен быть только на латинице (без кириллицы).";
  } else if (!isLatinOnly || !hasNoSpaces) {
    errorMessage = "Пароль содержит недопустимые символы или пробелы.";
  } else if (!minLength) {
    errorMessage = "Пароль должен содержать не менее 8 символов.";
  } else if (!hasUpper) {
    errorMessage = "Пароль должен содержать хотя бы одну заглавную букву (A-Z).";
  } else if (!hasLower) {
    errorMessage = "Пароль должен содержать хотя бы одну строчную букву (a-z).";
  } else if (!hasNumber) {
    errorMessage = "Пароль должен содержать хотя бы одну цифру (0-9).";
  }

  const isValid = minLength && hasUpper && hasLower && hasNumber && isLatinOnly && hasNoSpaces;

  return {
    isValid,
    score,
    criteria,
    errorMessage,
  };
}
