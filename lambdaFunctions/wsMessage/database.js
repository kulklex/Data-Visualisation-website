//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

//Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

//Returns all of the connection IDs
export async function getConnectionIds() {
    const scanCommand = new ScanCommand({
        TableName: "WebSocketClients"
    });
    
    const response  = await docClient.send(scanCommand);
    return response.Items;
}


//Deletes the specified connection ID
export async function deleteConnectionId(connectionId){
    console.log("Deleting connection Id: " + connectionId);

    const deleteCommand = new DeleteCommand ({
        TableName: "WebSocketClients",
        Key: {
            ConnectionId: connectionId
        }
    });
    return docClient.send(deleteCommand);
}

export async function getData(team){
    
    //Database query for arseal
    
    // let xArray = results.Items.map( item => item.Timestampo)
    
    let data = {
        team: {
            actual: {
                x: [1,2,3,4],
                y: [3,4,5,6]
            },
            // predicted: {
            //     x: [4,3,2,1],
            //     y: [6,5,4,3]
            // }
        }
    };

    // Data gotten from the database
    return data;
    
    
}

const Teams = ["Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United"];

for (const team in Teams) {
    getData(team);
}