import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateCredentials,
  cleanInput,
} from "./validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    it("should fail for empty emails", () => {
      expect(validateEmail("")).toEqual({ valid: false, error: "Email is required" });
      expect(validateEmail("   ")).toEqual({ valid: false, error: "Email is required" });
    });

    it("should fail for invalid email patterns", () => {
      expect(validateEmail("plain_text")).toEqual({
        valid: false,
        error: "Please enter a valid email address",
      });
      expect(validateEmail("missing_domain@")).toEqual({
        valid: false,
        error: "Please enter a valid email address",
      });
      expect(validateEmail("@missing_user.com")).toEqual({
        valid: false,
        error: "Please enter a valid email address",
      });
    });

    it("should pass for valid email patterns", () => {
      expect(validateEmail("test@example.com")).toEqual({ valid: true });
      expect(validateEmail("user.name+label@sub.domain.co.uk")).toEqual({ valid: true });
    });
  });

  describe("validatePassword", () => {
    it("should fail for empty passwords", () => {
      expect(validatePassword("")).toEqual({
        valid: false,
        error: "Password is required",
      });
    });

    it("should fail for passwords less than 6 characters", () => {
      expect(validatePassword("12345")).toEqual({
        valid: false,
        error: "Password must be at least 6 characters long",
      });
    });

    it("should pass for passwords with 6 or more characters", () => {
      expect(validatePassword("123456")).toEqual({ valid: true });
      expect(validatePassword("very_long_secure_password")).toEqual({ valid: true });
    });
  });

  describe("validateCredentials", () => {
    it("should fail if email is invalid", () => {
      expect(validateCredentials("invalid_email", "secure123")).toEqual({
        valid: false,
        error: "Please enter a valid email address",
      });
    });

    it("should fail if password is invalid", () => {
      expect(validateCredentials("test@example.com", "123")).toEqual({
        valid: false,
        error: "Password must be at least 6 characters long",
      });
    });

    it("should pass if both email and password are valid", () => {
      expect(validateCredentials("test@example.com", "secure123")).toEqual({
        valid: true,
      });
    });
  });

  describe("cleanInput", () => {
    it("should trim surrounding whitespace from inputs", () => {
      expect(cleanInput("  needs_trimming  ")).toBe("needs_trimming");
      expect(cleanInput("\t tabbed \n")).toBe("tabbed");
    });
  });
});
