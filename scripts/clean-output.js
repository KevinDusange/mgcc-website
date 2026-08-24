const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputDirectory = path.resolve(projectRoot, "public");
const expectedDirectory = path.join(projectRoot, "public");

if (outputDirectory !== expectedDirectory || outputDirectory === projectRoot || path.parse(outputDirectory).root === outputDirectory) {
    throw new Error(`Refusing to clean an unexpected output directory: ${outputDirectory}`);
}

if (fs.existsSync(outputDirectory)) {
    // Cloud-synced workspaces can briefly lock freshly generated files.
    fs.rmSync(outputDirectory, {
        recursive: true,
        force: true,
        maxRetries: 20,
        retryDelay: 250,
    });
    console.log(`Cleaned ${outputDirectory}`);
}
