//Import AWS
import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime"; 

// AWS DynamoDB imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

//Create SageMakerRuntimeClient
const client = new SageMakerRuntimeClient({
    region: "us-east-1"
});

// Configure AWS DynamoDB client
const client2 = new DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = DynamoDBDocumentClient.from(client2);

const endpointData = {
    "instances":
      [
        {
          "start":"2024-6-26 00:00:00",
          "target": [2,1,4,2,5,1,2,3,3,2,1,1,3,-2,3,3,2,-1,1,2,-1,1,-1,5,-1,5,5,1,0,1,0,2,3,-2,2,3,1,1,2,1,5,4,3,1,1,1,0,2,4,-1,1,3,0,2,0,3,4,4,5,4,0,1,2,4,0,2,5,0,3,3,4,-1,2,1,1,-1,2,0,1,-1,2,3,-1,2,2,0,3,2,1,3,3,2,3,1,3,1,3,1,0,-1]
        }
      ],
      "configuration":
         {
           "num_samples": 50,
            "output_types":["mean"],
            "quantiles":["0.1","0.9"]
         }
  }

//Calls endpoint and logs results
async function invokeEndpoint () {
    //Create and send command with data
    const command = new InvokeEndpointCommand({
        EndpointName: "MancityDataEndpoint",
        Body: JSON.stringify(endpointData),
        ContentType: "application/json",
        Accept: "application/json"
    });
    const response = await client.send(command);

 
    let predictions = JSON.parse(Buffer.from(response.Body).toString('utf8'));
    return predictions.predictions[0];
}


const team = "Manchester City"

async function fetchAndSavePredictedResults() {

    const results = await invokeEndpoint();
    results.mean.map(async (result) => {
        // Create DynamoDB PutCommand to store data
        const command = new PutCommand({
            TableName: "PredictedResults",
            Item: {
                "Score": result,
                "TeamName": team
            }
        });
        try {
            // Store data in DynamoDB
            await docClient.send(command);
            console.log(team + " updated");

        } catch (err) {
            console.error("Error saving data: ", err);
        }
        })
     
}

fetchAndSavePredictedResults()