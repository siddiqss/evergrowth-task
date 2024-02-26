const { handler } = require("./index.js");

jest.mock("node-fetch"); // Mock the `fetch` function for controlled testing

describe("handler function", () => {
  it("should return 400 for missing URL", async () => {
    const event = {}; // Event without URL
    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      expect.stringContaining("Missing required field: URL")
    );
  });

  it("should return 500 for failed data retrieval", async () => {
    const url = "https://google.com";
    const event = { url };

    // Mock `fetch` to return an error
    const mockFetch = jest.fn().mockRejectedValue(new Error("Network error"));
    require("node-fetch").default = mockFetch;

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(
      expect.stringContaining("Internal server error")
    );
  });

  it("should return successful response with prices (mocked data)", async () => {
    const url = "https://thatshirtwascash.com";
    const event = { url };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      url,
      minimum_tshirt_price: 18.95,
      maximum_tshirt_price: 98.95,
      currency: "USD",
    });
  });
});
