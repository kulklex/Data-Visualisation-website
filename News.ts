// Import axios library for making HTTP requests
import axios from 'axios';

// Import dotenv for loading environment variables from a .env file
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// An interface for API parameters
interface ApiParams {
  q: string;
  sortBy: string;
  language: string;
  apiKey: string;
}

// The base URL for the News API
const apiUrl: string = 'https://newsapi.org/v2/everything';

// Function to create dynamic API parameters
let createApiParams = (query: string): ApiParams => ({
  q: query,
  sortBy: 'popularity',
  language: 'en',
  apiKey: 'bc1697d5f460435fbf9be668688ee620', // API key 
});

// Function to make an API call
export const makeApiCall = async (query: string): Promise<void> => {
  try {
    // Create dynamic parameters based on the query
    const params = createApiParams(query);

    // Make a GET request using axios
    const response = await axios.get(apiUrl, { params });

    // Handle the API response
    console.log('API Response:', response.data?.articles);

    // Get the total number of articles
    console.log("\n" + response.data?.articles.length);
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
  }
};

// Example API calls for different football teams
makeApiCall("Arsenal FC");
makeApiCall("Chelsea FC");
makeApiCall("Liverpool FC");
makeApiCall("Manchester United");
makeApiCall("Manchester City FC");
