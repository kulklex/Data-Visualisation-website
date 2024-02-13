// Import axios library for making HTTP requests
import axios from 'axios';

// Import dotenv for loading environment variables from a .env file
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// AWS DynamoDB imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";


// An interface for API parameters
interface ApiParams {
  q: string;
  sortBy: string;
  language: string;
  apiKey: string;
}

interface ArticleType {
  title: string,
  author: string,
  source: object,
  publishedAt: string,
  url: string

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

// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = DynamoDBDocumentClient.from(client);

// Function to make an API call
export const makeApiCall = async (query: string): Promise<void> => {
  try {
    // Create dynamic parameters based on the query
    const params = createApiParams(query);

    // Make a GET request using axios
    const response = await axios.get(apiUrl, { params });

    // Handle the API response
    const articles = response.data?.articles;
    if (articles?.length) {
      articles.map(async (article:ArticleType) => {
      const dateString = article.publishedAt
      const dateInMilliSeconds = convertDateToMilliseconds(dateString)
      
      const command = new PutCommand({
      TableName: "FootballNews",
      Item: {
        "MatchTS": dateInMilliSeconds,
        "News": article.title,
        "TeamName": query,
        "Url": article.url
      }
    })
    try {
      // Store data in DynamoDB
      await docClient.send(command);
      console.log(query + " updated");
      
  } catch (err) {
      console.error("Error saving data: ", err);
  }
 
      })
    }
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
  }
};

function convertDateToMilliseconds(dateString: string): number {
  const dateInMilliSeconds = new Date(dateString).getTime();
  return dateInMilliSeconds;
}




// Example API calls for different football teams
makeApiCall("Arsenal FC");
makeApiCall("Chelsea FC");
makeApiCall("Liverpool FC");
makeApiCall("Manchester United");
makeApiCall("Manchester City FC");
