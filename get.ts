import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";


// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); //  AWS region

const docClient = DynamoDBDocumentClient.from(client);

export const main = async () => {
    const command = new GetCommand({
      TableName: "FootballMatches",
      Key: {
        TeamName: "Arsenal",
        MatchTS: 65547646576
      },
    });  
    
    const response = await docClient.send(command);
    console.log(response);
    return response;
  };

  main()