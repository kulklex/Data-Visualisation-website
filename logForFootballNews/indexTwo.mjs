import axios from 'axios';

// AWS DynamoDB imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = DynamoDBDocumentClient.from(client);

// API URL
const apiUrl = 'https://newsapi.org/v2/everything';

// Function to create dynamic API parameters
const createApiParams = (query) => ({
  q: query,
  sortBy: 'popularity',
  language: 'en',
  apiKey: 'bc1697d5f460435fbf9be668688ee620', // API key 
});

  const makeApiCall = async (query) => {
  try {
    // Create dynamic parameters based on the query
    const params = createApiParams(query);

    // Make a GET request using axios
    const response = await axios.get(apiUrl, { params });
    
     // Handle the API response
    const articles = response.data?.articles;
    if (articles?.length) {
      articles.map(async (article) => {
        const dateString = article.publishedAt;
        const dateInMilliSeconds = convertDateToMilliseconds(dateString);

      // Saving articles to FootballNews Table 
        const command = new PutCommand({
          TableName: "FootballNews",
          Item: {
            "MatchTS": dateInMilliSeconds,
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

      });
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




export const handler = async (event) => {
  // API calls for different football teams
  makeApiCall("Arsenal FC");
  makeApiCall("Chelsea FC");
  makeApiCall("Liverpool FC");
  makeApiCall("Manchester United");
  makeApiCall("Manchester City FC");

  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('News Data Stored!'),
  };
  return response;
};
