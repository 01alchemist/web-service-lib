import { maskPassword } from ".";

describe("maskPassword test suite", () => {
  describe("When passing falsy input", () => {
    it("Should return input value", () => {
      const maskedUrl = maskPassword(null);
      expect(maskedUrl).toBe(null);
    });
  });
  describe("When passing a connection string with password", () => {
    it("Should mask the password with ****", () => {
      const maskedUrl = maskPassword("protocol://user:password@server.com");
      expect(maskedUrl).toBe("protocol://user:****@server.com");
    });
    it("Should not mask anything if the password is empty", () => {
      const maskedUrl = maskPassword("protocol://user:@server.com");
      expect(maskedUrl).toBe("protocol://user:@server.com");
    });
    it("Should not mask anything if the pattern does not match", () => {
      const maskedUrl = maskPassword("user:password@server.com");
      expect(maskedUrl).toBe("user:password@server.com");
    });
  });
});
