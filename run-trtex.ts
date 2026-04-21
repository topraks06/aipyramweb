import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { TrtexLeadAgent } from './src/core/swarm/trtex/trtex-lead-agent';

async function run() {
  const agent = new TrtexLeadAgent();
  await agent.runCycle();
  process.exit(0);
}
run();
