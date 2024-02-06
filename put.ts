import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";


// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); //  AWS region
const docClient = DynamoDBDocumentClient.from(client);


export const main = async () => {
    const command = new PutCommand({
      TableName: "FootballMatches",
      Item: {}
    });  
    
    const response = await docClient.send(command);
    console.log(response);
    return response;
  };

  main()