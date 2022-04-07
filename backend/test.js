const server = require("./server.js");
const supertest = require("supertest");
const app = require("./app");
const { writeFile } = require("fs/promises");

let todayMidnight;

beforeAll(async () => {
  await writeFile("users.json", JSON.stringify([]));
  const today = new Date().setUTCHours(0, 0, 0, 0);
  todayMidnight = new Date(today).toJSON();
});

describe("Rewards Endpoints", () => {
  const rewardsMarch15th = [
    {
      availableAt: "2022-03-13T00:00:00.000Z",
      expiresAt: "2022-03-14T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-03-14T00:00:00.000Z",
      expiresAt: "2022-03-15T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-03-15T00:00:00.000Z",
      expiresAt: "2022-03-16T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-03-16T00:00:00.000Z",
      expiresAt: "2022-03-17T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-03-17T00:00:00.000Z",
      expiresAt: "2022-03-18T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-03-18T00:00:00.000Z",
      expiresAt: "2022-03-19T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-03-19T00:00:00.000Z",
      expiresAt: "2022-03-20T00:00:00.000Z",
      redeemedAt: null,
    },
  ];

  const rewardsApril7th = [
    {
      availableAt: "2022-04-03T00:00:00.000Z",
      expiresAt: "2022-04-04T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-04-04T00:00:00.000Z",
      expiresAt: "2022-04-05T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-04-05T00:00:00.000Z",
      expiresAt: "2022-04-06T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-04-06T00:00:00.000Z",
      expiresAt: "2022-04-07T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-04-07T00:00:00.000Z",
      expiresAt: "2022-04-08T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-04-08T00:00:00.000Z",
      expiresAt: "2022-04-09T00:00:00.000Z",
      redeemedAt: null,
    },
    {
      availableAt: "2022-04-09T00:00:00.000Z",
      expiresAt: "2022-04-10T00:00:00.000Z",
      redeemedAt: null,
    },
  ];

  it("GET /user/:id/rewards?at= should generate a user with id 1 and fetch rewards for april 7th", async () => {
    const res = await supertest(app).get("/users/1/rewards?at=2022-04-07T12:00:00Z");
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("data", rewardsApril7th);
  });

  it("GET /user/:id/rewards?at= should generate a user with id 2 and fetch rewards for march 15th", async () => {
    const res = await supertest(app).get("/users/2/rewards?at=2022-03-15T12:00:00Z");
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("data", rewardsMarch15th);
  });

  it("GET /user/:id/rewards?at= should generate a user with id 4 and fetch rewards for today", async () => {
    const res = await supertest(app).get(`/users/4/rewards?at=${todayMidnight}`);
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).not.toHaveProperty("data", []);
  });

  it("GET /user/:id/rewards?at= should send invalid user id error", async () => {
    const res = await supertest(app).get("/users/</rewards?at=2022-04-07T12:00:00Z");
    expect(res.status).toEqual(400);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("error.message", "Invalid User Id");
  });

  it("GET /user/:id/rewards?at= should send invalid date error", async () => {
    const res = await supertest(app).get("/users/1/rewards?at=2022-04-07qwer");
    expect(res.status).toEqual(400);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("error.message", "Invalid Date");
  });

  it("PATCH /users/:id/rewards/availableAt/redeem should redeem reward", async () => {
    const res = await supertest(app).patch(`/users/4/rewards/${todayMidnight}/redeem`);
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).not.toHaveProperty("data.redeemedAt", null);
  });

  it("PATCH /users/:id/rewards/availableAt/redeem should send error no user found for this is", async () => {
    const res = await supertest(app).patch(`/users/3/rewards/${todayMidnight}/redeem`);
    expect(res.status).toEqual(404);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("error.message", "No user found for id 3");
  });

  it("PATCH /users/:id/rewards/availableAt/redeem should send reward is expired", async () => {
    const res = await supertest(app).patch(`/users/4/rewards/${todayMidnight}/redeem`);
    expect(res.status).toEqual(410);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("error.message", "This reward is already expired");
  });
});
