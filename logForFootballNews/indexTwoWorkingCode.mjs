// Importing axios for making HTTP requests
import axios from 'axios';

// AWS DynamoDB imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); // Specify AWS region
const docClient = DynamoDBDocumentClient.from(client); // Creating a DynamoDB document client

// API URL
const apiUrl = 'https://newsapi.org/v2/everything';

// Function to create dynamic API parameters
const createApiParams = (query) => ({
  q: query,
  sortBy: 'popularity',
  language: 'en',
  apiKey: 'bc1697d5f460435fbf9be668688ee620', // API key 
});

// Function to make API call to News API and store data in DynamoDB
const makeApiCall = async (query) => {
  try {
    // Create dynamic parameters based on the query
    const params = createApiParams(query);
    
    // Make a GET request using axios
    const response = await axios.get(apiUrl, { params });
    
    // Logging API response data
    console.log(JSON.stringify(response.data));
    
    // Iterating over each article in the API response
    for (let article of response.data.articles) {
      console.log(`${article.title} ${article.publishedAt}`);
      
      // Saving articles to FootballNews Table 
      const command = new PutCommand({
        TableName: "FootballNews",
        Item: {
          "MatchTS": parseInt(article.publishedAt), // Converting publishedAt to milliseconds
          "News": article.title,
          "TeamName": query,
          "Url": article.url
        }
      });
      
      try {
        // Store data in DynamoDB
        await docClient.send(command);
        console.log(query + " updated");

      } catch (err) {
        console.error("Error saving data: ", err);
      }
    }
  } catch (error) {
    // Handle errors
    console.error('News API Call Error: ', error);
  }
};

// Function that converts date string to milliseconds
function convertDateToMilliseconds(dateString) {
  const dateInMilliSeconds = new Date(dateString).getTime();
  return dateInMilliSeconds;
}

// AWS Lambda handler function
export const handler = async (event) => {
  // API calls for different football teams
  // await makeApiCall("Arsenal FC");
  // await makeApiCall("Chelsea FC");
  // await makeApiCall("Liverpool FC");
  await makeApiCall("Manchester United");
  // await makeApiCall("Manchester City FC");
  
  // Success response object
  const response = {
    statusCode: 200,
    body: JSON.stringify('News Data Stored!'),
  };
  
 

  return response; 
};
