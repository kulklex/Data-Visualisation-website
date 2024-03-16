import axios from 'axios';
import { promises as fs } from 'fs';

async function downloadDataAndSaveToFile(): Promise<void> {
    try {
        const response = await axios.get('https://y2gtfx0jg3.execute-api.us-east-1.amazonaws.com/prod/M00919866');
        
        // The response data is automatically converted to JSON, so no need to call .json()
        const data = response.data;
        
        // Convert the JSON object to a string with pretty print
        const dataStr = JSON.stringify(data, null, 2);
        
        // Write the string to a file named data.json
        await fs.writeFile('synthetic_data.json', dataStr, 'utf8');
        console.log('Data saved to data.json');
    } catch (error) {
        console.error('Error downloading or saving the data:', error);
    }
}

downloadDataAndSaveToFile();
