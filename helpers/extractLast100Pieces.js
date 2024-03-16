const fs = require('fs').promises;

async function extractLast100AndSave(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        
        const jsonData = JSON.parse(data);
        
        const last100Data = {
            start: [],
            target: []
        };

        if (jsonData.start && jsonData.start.length > 100) {
            last100Data.start = jsonData.start.slice(-100);
        } else {
            last100Data.start = jsonData.start;
        }
        
        if (jsonData.target && jsonData.target.length > 100) {
            last100Data.target = jsonData.target.slice(-100);
        } else {
            last100Data.target = jsonData.target;
        }

        const newFilename = filename.replace('.json', '_test.json');
        await fs.writeFile(newFilename, JSON.stringify(last100Data, null, 2), 'utf8');

        console.log(`The last 100 elements (or all elements if fewer than 100) from both 'start' and 'target' were successfully saved to ${newFilename}`);
    } catch (error) {
        console.error('Error processing the file:', error);
    }
}


extractLast100AndSave('team_Manchester_City.json');
