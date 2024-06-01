const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const request = require("supertest");
const mockingoose = require("mockingoose");
const app = require("../app");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");

describe("Post API", () => {
  let token;
  const USER_ID = 123456789;
  const USER_ROLE = "utilisateur";

  const MOCK_DATA_CREATED = {
    userId: USER_ID,
    message: "test publication",
    picture: "http://lien-image.com",
  };

  const MOCK_DATA = {
    userId: USER_ID,
    message: "test publication dans la bdd",
    picture: "http://lien-image1.com",
  };

  beforeEach(() => {
    token = jwt.sign(
      { userId: USER_ID, role: USER_ROLE },
      process.env.RANDOM_TOKEN_SECRET
    );
    mockingoose(Post).toReturn(MOCK_DATA_CREATED, "save");
    mockingoose(Post).toReturn(MOCK_DATA, "find");
  });

  it("should create a new post", async () => {
    const res = await request(app)
      .post("/api/post")
      .send(MOCK_DATA_CREATED)
      .set("Cookie", `jwt=${token}`);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Post enregistré !");
  });

  it("should retrieve all post", async () => {
    const res = await request(app)
      .get("/api/post")
      .set("Cookie", `jwt=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(MOCK_DATA.message);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
