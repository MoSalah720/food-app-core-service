import http from "http";
import{createApp} from "./app";
import {env} from "./common/config/env";
import {db} from "./common/knex/knex";

const app = createApp();
const server = http.createServer(app);

server.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});

async function shutdown() {
    server.close(async () => {
        console.log("Server Shutdown");
        await db.destroy();
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);