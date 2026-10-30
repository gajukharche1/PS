import { describe, it, expect } from "vitest";
import { sanitizeRichText, stripHtml } from "@/lib/security/sanitize";

describe("HTML Sanitizer & XSS Defenses", () => {
  it("strips malicious script tags completely", () => {
    const dirty = "<p>Hello world</p><script>alert('XSS')</script>";
    const clean = sanitizeRichText(dirty);
    expect(clean).toBe("<p>Hello world</p>");
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("alert");
  });

  it("strips onload and onerror event handlers", () => {
    const dirty = '<img src="x" onerror="alert(1)" /><p>Safe text</p>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toBe("<p>Safe text</p>");
    expect(clean).not.toContain("onerror");
  });

  it("enforces nofollow and noopener on allowed links", () => {
    const dirty = '<a href="https://example.com">Visit us</a>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toContain('rel="nofollow noopener noreferrer"');
    expect(clean).toContain('target="_blank"');
  });

  it("disallows javascript: URI schemes", () => {
    const dirty = '<a href="javascript:alert(1)">Click</a>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toContain('href="#"');
    expect(clean).not.toContain("javascript:");
  });

  it("stripHtml removes all HTML tags cleanly", () => {
    const dirty = "<h1>Header</h1><p>Paragraph with <strong>bold</strong> text.</p>";
    const clean = stripHtml(dirty);
    expect(clean).toBe("Header Paragraph with bold text.");
    expect(clean).not.toContain("<");
    expect(clean).not.toContain(">");
  });
});
