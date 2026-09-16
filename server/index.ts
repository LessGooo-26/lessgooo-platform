import { resolve } from "node:path";
import { CampusStore } from "./store";
import { createCampusServer } from "./http";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) loadEnvFile(".env.local");

const development = process.env.CAMPUS_DEV === "1";
const port = Number(process.env.PORT || (development ? 4174 : 4173));
const store = new CampusStore(
  resolve(process.env.CAMPUS_DATA_DIR || ".local-data", "campus.sqlite"),
);
const server = createCampusServer(store, {
  port,
  devPort: development ? 5173 : undefined,
  staticDir: development ? undefined : "dist",
});
// Container networking is opt-in; Compose publishes only on the host loopback.
const host = process.env.CAMPUS_CONTAINER === "1" ? "0.0.0.0" : "127.0.0.1";
server.listen(port, host, () =>
  console.info(`LESSGOOO local demo: http://127.0.0.1:${port}/campus.html`),
);
server.on("error", (error) => {
  console.error(error.message);
  store.close();
  process.exitCode = 1;
});
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () =>
    server.close(() => {
      store.close();
      process.exit(0);
    }),
  );
