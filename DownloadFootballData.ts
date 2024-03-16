import axios from 'axios';
import { promises as fs } from 'fs';
import { format } from 'date-fns';

// AWS DynamoDB imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = DynamoDBDocumentClient.from(client);

interface MatchResult {
    MatchTS: number;
    Score: number;
    TeamName: string;
}

interface TeamData {
    start: string[];
    target: number[];
}


// Process and save data for each team
async function processAndSaveDataByTeam(): Promise<void> {
    try {
        const matchResults: MatchResult[] = await getMatchResults();
        const groupedResults = groupByTeam(matchResults);

        for (const teamName in groupedResults) {
            const teamResults = groupedResults[teamName];
            const teamData: TeamData = {
                start: teamResults.map(result => timestampToDate(result.MatchTS)),
                target: teamResults.map(result => result.Score),
            };

            // Create a single JSON object for the team
            const dataStr = JSON.stringify(teamData, null, 2);

            // Create files using this naming convention
            const fileName = `team_${teamName.replace(/\s+/g, '_')}.json`;
            await fs.writeFile(fileName, dataStr, 'utf8');
            console.log(`Processed data for ${teamName} saved to ${fileName}`);
        }
    } catch (error) {
        console.error('Error processing or saving the data by team:', error);
    }
}

// Returns all of the match results
async function getMatchResults(): Promise<MatchResult[]> {
    const scanCommand = new ScanCommand({
        TableName: "FootballMatches",
    });

    const response = await docClient.send(scanCommand);
    return response.Items as MatchResult[];
}

// Function to group match results by team
function groupByTeam(matchResults: MatchResult[]): Record<string, MatchResult[]> {
    return matchResults.reduce((acc, matchResult) => {
        const { TeamName } = matchResult;
        if (!acc[TeamName]) {
            acc[TeamName] = [];
        }
        acc[TeamName].push(matchResult);
        return acc;
    }, {} as Record<string, MatchResult[]>);
}


// Convert timestamp to formatted date string
function timestampToDate(timestamp: number): string {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
}


processAndSaveDataByTeam();
