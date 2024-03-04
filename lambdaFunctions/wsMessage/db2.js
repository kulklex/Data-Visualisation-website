//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

//Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// All the teams
const Teams = ["Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United"];

//Returns all of the connection IDs
export async function getConnectionIds() {
    const scanCommand = new ScanCommand({
        TableName: "WebSocket"
    });
    
    const response  = await docClient.send(scanCommand);
    return response.Items;
}


//Deletes the specified connection ID
export async function deleteConnectionId(connectionId){
    console.log("Deleting connection Id: " + connectionId);

    const deleteCommand = new DeleteCommand ({
        TableName: "WebSocket",
        Key: {
            ConnectionId: connectionId
        }
    });
    return docClient.send(deleteCommand);
}


//Returns all Match Results
export async function getTeamResults() {
    const command = new ScanCommand({ TableName: "FootballMatches" });
    
    const response  = await docClient.send(command);
    return response.Items;
}


export async function getData(){
    
    const results = await getTeamResults();
    
    let xArray = results?.map( item => item.Score);
    let yArray = results?.map( item => item.MatchTS);
    let team = results?.map( item => item.TeamName);
    
    let data = {
        actual: {
            x: xArray,
            y: yArray,
            t: team
        }
    };
    console.log(data);
    // Data gotten from the database
    return data;
}


// for (const team in Teams) {
//     getData(team);
// }