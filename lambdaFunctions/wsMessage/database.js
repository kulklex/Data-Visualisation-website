//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

//Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


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

//Returns all Match Results
export async function getTeamResults(team) {
    const command = new QueryCommand({
        TableName: "FootballMatches",
        KeyConditionExpression: "TeamName = :teamName",
        ExpressionAttributeValues: {
            ":teamName": team
        },
    });

    const response = await docClient.send(command);
    return response.Items;
}


export async function getData(teamName) {
    const results = await getTeamResults(teamName);

    let xArray = results?.map(item => {
        // convert timestamp in millisecs to usable date format
        const timestamp = item.MatchTS;
        const date = new Date(timestamp);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    });
    let yArray = results?.map(item => item.Score);

    let data = {
        actual: {
            x: xArray,
            y: yArray,
            type: "scatter"
        }
    };

    return data;
}
