const cron = require('node-cron');
const { generateStatistics } = require('./detailedArchiveStatistics');
const { generateArchived } = require('./healthChecksArchived');
const { generateReceived } = require('./healthChecksReceived');

// Every minute
// for 4:10 PM => 10 16 * * *
cron.schedule('* * * * *', async () => {
    await generateStatistics();
    await generateArchived();
    await generateReceived();
})