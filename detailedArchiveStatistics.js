const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const createCsvArrayWriter = require('csv-writer').createArrayCsvWriter;
const moment = require('moment');
const path = require('path');

async function generateStatistics() {

    if (!fs.existsSync('./attachments')) {
        fs.mkdirSync('./attachments');
    }

    if (!fs.existsSync('./inputFiles')) {
        fs.mkdirSync('./inputFiles');
    }


    // Set the directory path
    const currentDate = moment().format('YYYY-MM-DD');
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm');
    //const directoryPath = `./attachments/gen_${currentDate}`;
    const directoryPath = `./attachments/detailedArchiveStatistics`;

    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }

    // Set the CSV output file path
    const csvFilePath = `./inputFiles/detailed-archive-statistics-report.csv`;

    if (!fs.existsSync('./inputFiles')) {
        fs.mkdirSync('./inputFiles');
    }

    // Define CSV headers
    const csvHeaders = [
        'Repository Name', 'Date Of Event', 'Doc Class Name', 'Total Msgs', 'Total Size In MB', 'Exported Date'
    ];

    // Define CSV writer
    const csvArrayWriter = createCsvArrayWriter({
        header: csvHeaders,
        path: csvFilePath,
        append: true // append to existing file if it exists
    });

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
        // Create CSV file with headers if it doesn't exist
        csvArrayWriter.writeRecords([csvHeaders]).then(() => {
            console.log('CSV file created successfully');
            console.log('-------------------------');
        }).catch((err) => {
            console.error(err);
        });
    } else {
        console.log('CSV file exists.');
        console.log('-------------------------');
    }

    // Create a CSV writer object
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        append: true, // append to existing file if it exists
        header: [
            { id: 'repositoryname', title: 'Repository Name' },
            { id: 'dateofevent', title: 'Date Of Event' },
            { id: 'docclassname', title: 'Doc Class Name' },
            { id: 'totalmsgs', title: 'Total Msgs' },
            { id: 'totalsize_in_MB', title: 'Total Size In MB' },
            { id: 'exported_date', title: 'Exported Date' },
        ]
    });


    // Read the files in the directory
    fs.readdir(directoryPath, async (err, files) => {
        if (err) {
            console.log('Error reading directory:', err);
            return;
        }
        // Loop through each file in the directory
        files.map(async file => {
            // Get the full path of the file
            const filePath = `${directoryPath}/${file}`;
            const fileExtension = path.extname(filePath);
            const matches = [];

            if (fileExtension !== '.xlsx' && fileExtension !== '.xls') {
                // Read the content of the file
                fs.readFile(filePath, 'utf8', async (err, data) => {
                    if (err) {
                        console.log('Error reading file:', err);
                        return;
                    }
                    const result = parseText(data);
                    await csvWriter.writeRecords(result);
                    console.log("Gen Data Generated!");
                    fs.unlink(filePath, (error) => {
                        if (error) {
                            console.log(`Error Deleting Gen (${file}) File!`);
                        } else {
                            console.log(`Gen (${file}) File Deleted Successfully!`);
                        }
                    })
                });
            }
        });
    });
}

function parseText(text) {
    const bodyStartIndex = text.indexOf('Body:');
    const bodyText = text.substring(bodyStartIndex + 6).trim();
    const rows = bodyText.split('\n');
    const columnNamesRow = rows[0];
    const columnNames = columnNamesRow.match(/\S+/g);

    const data = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const columns = row.match(/\S+/g);

        if (columns && columns.length === columnNames.length) {
            const rowObject = {};
            for (let j = 0; j < columnNames.length; j++) {
                rowObject[columnNames[j]] = columns[j];
            }
            rowObject['exported_date'] = moment().format('YYYY-MM-DD HH:mm');
            data.push(rowObject);
        }
    }
    return data;
}


module.exports = {
    generateStatistics
}