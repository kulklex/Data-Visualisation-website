//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

//Import API Gateway
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

//Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


export const handler = async (event) => {
  try {
    //Get Message from event
    const msg = JSON.parse(event.body).data;
    console.log("Message: " + msg);

    //Extract domain and stage from event
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    console.log("Domain: " + domain + " stage: " + stage);

    //Get promises to send messages to connected clients
    let sendMsgPromises = await getSendMessagePromises(msg, domain, stage);

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
export async function getSendMessagePromises(message, domain, stage) {

  //Get connection IDs of clients
  let clientIdArray = await getConnectionIds();
  console.log("\nClient IDs:\n" + JSON.stringify(clientIdArray));
  console.log("domainName: " + domain + "; stage: " + stage);

  //Create API Gateway management class.
  const callbackUrl = `https://${domain}/${stage}`;
  const apiGwClient = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });

  //Try to send message to connected clients
  let msgPromiseArray = clientIdArray.map(async item => {
    //Extract connection ID
    const connId = item.ConnectionId;
    try {
      console.log("Sending message '" + message + "' to: " + connId);

      //Create post to connection command
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connId,
        Data: message
      });

      //Wait for API Gateway to execute and log result
      await apiGwClient.send(postToConnectionCommand);
      console.log("Message '" + message + "' sent to: " + connId);
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
