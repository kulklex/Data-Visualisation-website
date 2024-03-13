//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

//Import API Gateway
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

//Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


export const handler = async (event) => {
  console.log(JSON.stringify(event));
  try {
    const data = [];
    
    //Extract data from event
  for(let record of event.Records){
    if(record.eventName === "INSERT"){
      //Extract data from event
      const results = record.dynamodb.NewImage.Result.M;
      
      //Extract timestamp
      const timestamp = record.dynamodb.NewImage.MatchTS.N;
    
      //Extract team
      const team = record.dynamodb.NewImage.TeamName.S;
      
      data.push({results, timestamp, team});
    }
  }

    
    console.log("Message: ",  data);

    //Get promises to send messages to connected clients
    let sendMsgPromises = await getSendMessagePromises({
      type: 'text',
      data
    });

    //Execute promises
    await Promise.all(sendMsgPromises);
  }
  catch (err) {
    return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
  }

  //Success
  return { statusCode: 200, body: "Data sent successfully." };
};



//Returns promises to send messages to all connected clients
export async function getSendMessagePromises(message) {

  //Get connection IDs of clients
  let clientIdArray = await getConnectionIds();

  //Create API Gateway management class.
  const callbackUrl = 'https://3b588j212a.execute-api.us-east-1.amazonaws.com/production/';
  const apiGwClient = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });

  //Try to send message to connected clients
  let msgPromiseArray = clientIdArray.map(async item => {
    //Extract connection ID
    const connId = item.ConnectionId;
    try {

      //Create post to connection command
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connId,
        Data: JSON.stringify(message)
      });

      //Wait for API Gateway to execute and log result
      await apiGwClient.send(postToConnectionCommand);
    }
    catch (err) {
      console.log("Failed to send message to: " + connId);

      //Delete connection ID from database
      if (err.statusCode == 410) {
        try {
          await deleteConnectionId(connId);
        }
        catch (err) {
          console.log("ERROR deleting connectionId: " + JSON.stringify(err));
          throw err;
        }
      }
      else {
        console.log("UNKNOWN ERROR: " + JSON.stringify(err));
        throw err;
      }
    }
  });

  return msgPromiseArray;
}

//Returns all of the connection IDs
export async function getConnectionIds() {
  const scanCommand = new ScanCommand({
    TableName: "WebSocket"
  });

  const response = await docClient.send(scanCommand);
  return response.Items;
}


//Deletes the specified connection ID
export async function deleteConnectionId(connectionId) {
  console.log("Deleting connection Id: " + connectionId);

  const deleteCommand = new DeleteCommand({
    TableName: "WebSocket",
    Key: {
      ConnectionId: connectionId
    }
  });
  return docClient.send(deleteCommand);
}
