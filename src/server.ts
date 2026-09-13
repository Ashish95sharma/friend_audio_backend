import http from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { attachWebSocket } from "./websocket/websocket.server";
async function main() {
  await connectDatabase();
  const server = http.createServer(app);
  attachWebSocket(server);
  server.listen(env.PORT, "0.0.0.0", () =>
    console.log(`Friend Audio API listening on ${env.PORT}`),
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
