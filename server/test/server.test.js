const request = require("supertest");
const { PlaidExpressServer } = require("../lib/server");

const instance = PlaidExpressServer.getInstance();

describe("The Plaid Express Server", () => {
  test("can create a public token", () => {
    return request(instance.app).post("/api/generate_public_token").expect(200);
  });
  test("can list institutions", () => {
    return request(instance.app).post("/api/list_institutions").expect(200);
  });
  test("can query for info", () => {
    return request(instance.app).post("/api/info").expect(200);
  });
  test("can set the access token", () => {
    return request(instance.app).post("/api/set_access_token").expect(200);
  });
  test("can list transactions", () => {
    return request(instance.app).get("/api/transactions").expect(200);
  });
});
