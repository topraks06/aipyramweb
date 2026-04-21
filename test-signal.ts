import { collectSignals } from './src/core/aloha/signalCollector';
collectSignals('trtex').then(r => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
