/**
 * Validation utilities for form inputs
 */

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns Object with valid flag and optional error message
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { valid: false, error: "Email is required" };
  }

  // Simple email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true };
}

/**
 * Validates password
 * @param password - Password string to validate
 * @returns Object with valid flag and optional error message
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    return { valid: false, error: "Password is required" };
  }

  if (trimmedPassword.length < 6) {
    return {
      valid: false,
      error: "Password must be at least 6 characters long",
    };
  }

  return { valid: true };
}

/**
 * Validates both email and password
 * @param email - Email string
 * @param password - Password string
 * @returns Object with valid flag and optional error message for first invalid field
 */
export function validateCredentials(
  email: string,
  password: string
): { valid: boolean; error?: string } {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  return { valid: true };
}

/**
 * Trims and returns cleaned input
 */
export function cleanInput(input: string): string {
  return input.trim();
}
