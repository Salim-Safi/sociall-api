const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const request = require("supertest");
const mockingoose = require("mockingoose");
const app = require("../app");
const User = require("../models/User");

describe("User API", () => {
  const MOCK_DATA_CREATED = {
    firstName: "jane",
    lastName: "doe",
    email: "jane@example.com",
    password: "test123",
  };

  beforeEach(() => {
    mockingoose(User).toReturn(MOCK_DATA_CREATED, "save");
  });

  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send(MOCK_DATA_CREATED);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Utilisateur créé !");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
