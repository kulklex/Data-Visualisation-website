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

//Returns results based on query
export async function getQueryResults(team, tableName) {
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "TeamName = :teamName",
        ExpressionAttributeValues: {
            ":teamName": team
        },
    });

    const response = await docClient.send(command);
    const result = response.Items;

    // Returning results for the last 100 matches 
    return result.slice(Math.max(result.length - 100, 0));
}

export async function getSentimentData(team) {
    // Creating a new variable based on stored values in DB
    let sentimentTeam;
    if (team === "Manchester Utd") {
        sentimentTeam = "Manchester United";
    }
    else {
        sentimentTeam = team + " FC";
    }

    const command = new QueryCommand({
        TableName: "Sentiments",
        KeyConditionExpression: "TeamName = :teamName",
        ExpressionAttributeValues: {
            ":teamName": sentimentTeam, // Pass the team name directly as a string
        },
    });

    try {
        const response = await docClient.send(command);
        console.log("Team: " + team);
        const result = response.Items;
        return result;
    }
    catch (error) {
        console.error("Error fetching sentiment data:", error);
        throw error; // Or handle it as needed
    }
}



// Fetch football teams results and process the data
export async function getData(teamName) {
    const results = await getQueryResults(teamName, "FootballMatches");
    const predictions = await getQueryResults(teamName, "PredictedResults");

    // Actual result for x axis
    let actualXArray = results?.map(item => {
        // convert timestamp in millisecs to usable date format
        const timestamp = item.MatchTS;
        const date = new Date(timestamp);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    });
    
    // Actual result for y axis
    let actualYArray = results?.map(item => item.Score);
    
    // Predicted result for y axis
    let predictedYArray = predictions?.map(item => item.Score);

    let data = {
        actual: {
            x: actualXArray,
            y: actualYArray,
            type: "scatter"
        },
        predicted: {
            x: ['2023-09-01', '2023-10-04', '2023-11-06', '2023-12-09', '2024-01-11', '2024-02-13', '2024-03-17', '2024-04-19', '2024-05-22', '2024-06-24', '2024-07-01', '2024-07-08', '2024-07-15', '2024-07-22', '2024-07-29', '2024-08-05', '2024-08-12', '2024-08-19', '2024-08-26', '2024-09-02', '2024-09-09', '2024-09-16', '2024-09-23', '2024-09-30', '2024-10-07', '2024-10-14', '2024-10-21', '2024-10-28', '2024-11-04', '2024-11-11', '2024-11-18', '2024-11-25', '2024-12-02', '2024-12-09', '2024-12-16', '2024-12-23', '2024-12-30', '2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27', '2025-02-03', '2025-02-10', '2025-02-17', '2025-02-24', '2025-03-03', '2025-03-10', '2025-03-17', '2025-03-24', '2025-03-31'],
            y: predictedYArray,
            type: "scatter"
        }
    };

    return data;
}


export async function getSentiments(teamName) {
    const results = await getSentimentData(teamName);
    const labels = results?.map(item => item.Result.label);

    const data = [labels];
    console.log("Data: " + data);
    return data;
}
