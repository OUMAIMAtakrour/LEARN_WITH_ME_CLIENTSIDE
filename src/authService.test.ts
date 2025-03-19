import { authService } from "./api/services/authService"; // Adjust path to match authService.ts location

describe("AuthService", () => {
  it("should register and login a user", async () => {
    try {
      await authService.register({
        name: "Test",
        email: "test@example.com",
        password: "password123",
      });
      console.log("Registration successful");

      const loginResult = await authService.login({
        email: "test@example.com",
        password: "password123",
      });
      console.log("Login successful:", loginResult);
    } catch (err) {
      console.error("Error:", err);
      throw err;
    }
  }, 60000); // 60s timeout
});
