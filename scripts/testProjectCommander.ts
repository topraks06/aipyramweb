import { auditAllProjects } from "../src/core/ide/projectCommander";

async function run() {
    console.log("TESTING AUDIT...");
    const result = await auditAllProjects();
    console.log(JSON.stringify(result, null, 2));
}

run();
