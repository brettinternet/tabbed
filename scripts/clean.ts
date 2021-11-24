import { rm } from "fs/promises";
import { resolve } from "path";

const projectRoot = resolve(__dirname, "..");
const queue = [resolve(projectRoot, "build"), resolve(projectRoot, "coverage")];

void Promise.all(
  queue.map(async (dir) => {
    rm(dir, { recursive: true, force: true });
  })
);
