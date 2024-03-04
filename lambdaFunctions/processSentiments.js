import axios from 'axios';

// AWS DynamoDB imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
 console.log(JSON.stringify(event))
  
  //Extract data from event
  for(let record of event.Records){
    if(record.eventName === "INSERT"){
      //Extract data from event
      const text = record.dynamodb.NewImage.News.S;
      
      //Extract timestamp and team
      const timestamp = record.dynamodb.NewImage.MatchTS.N;
    
    //Extract team
    const team = record.dynamodb.NewImage.TeamName.S;
      
      
   
    //Process news text for sentiment
    //URL of web service
    let url = `http://text-processing.com/api/sentiment/`;

    //Sent GET to endpoint with Axios
    let response = await axios.post(url, {
            text: text
        },{
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
      
    console.log(`News: ${text} \n`);
    console.log(`Timestamp: ${timestamp}\n`);
    console.log(`Teamname: ${team}\n`);
      
      
    //Have sentiment, team and timstamp  
    const sentiment = JSON.stringify(response.data);
    console.log(`Sentiment: ${JSON.parse(sentiment)}\n`);

      
      
      //Save result in Sentiment table 
      const command = new PutCommand({
          TableName: "Sentiments",
          Item: {
            "MatchTS": parseInt(timestamp),
            "TeamName": team,
            "Result": JSON.parse(sentiment),
          }
        });
        try {
          // Store data in DynamoDB
          await docClient.send(command);
          console.log(team + " sentiment updated");

        } catch (err) {
          console.error("Error saving data: ", err);
        }

    }
    
    
  }
  
  // TODO implement
  console.log(JSON.stringify(event));
  const response = {
    statusCode: 200,
  };
  return response;
};
