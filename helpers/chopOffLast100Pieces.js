const fs = require('fs').promises;

async function chopOffLast100Pieces(originalFilename) {
    try {
        
        const data = await fs.readFile(originalFilename, 'utf8');
        
        
        const jsonData = JSON.parse(data);
        
        
        if (jsonData.start && jsonData.start.length > 100) {
            jsonData.start = jsonData.start.slice(0, -100);
        }
        if (jsonData.target && jsonData.target.length > 100) {
            jsonData.target = jsonData.target.slice(0, -100);
        }
        
       
        const newFilename = originalFilename.replace('.json', '_train.json');
        
        
        await fs.writeFile(newFilename, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`The last 100 elements were successfully removed from both 'start' and 'target'. Result saved in ${newFilename}`);
    } catch (error) {
        console.error('Error processing the file:', error);
    }
}

chopOffLast100Pieces('./team_Manchester_City.json');
