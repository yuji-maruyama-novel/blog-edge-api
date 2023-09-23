import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";
import { Config, connect } from "@planetscale/database";

const app = new Hono();
const token = "";

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:3000"],
  }),
  bearerAuth({ token })
);

// キャッシュを消すようにfetchを上書きする必要がある
const config: Config = {
  url: "",
  fetch: (url, init) => {
    delete (init as any)["cache"];
    return fetch(url, init);
  },
};

const conn = connect(config);

app.get("/api/article", async (c) => {
  try {
    const results = await conn.execute("select * from Contents");
    if (results?.rows?.length) {
      return c.json(results.rows);
    }
    throw new HTTPException(400, { message: "Error" });
  } catch (e) {
    return c.text("失敗");
  }
});

app.get("/api/article/:id", async (c) => {
  try {
    const { id } = c.req.param();
    if (!id) {
      throw new HTTPException(400, { message: "Error" });
    }
    const results = await conn.execute(
      `select * from Contents where id = ${id}`
    );
    if (results?.rows?.length > 0) {
      return c.json(results.rows[0]);
    }
    throw new HTTPException(400, { message: "Error" });
  } catch (error) {
    throw new HTTPException(400, { message: "Error" });
  }
});

export default app;
