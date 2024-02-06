// File locations
const csvFile: string = "premier-league-matches.csv";

// Node modules
import csv from 'csv-parser';
import fs from 'fs';

// AWS DynamoDB imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure AWS DynamoDB client
const client = new DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = DynamoDBDocumentClient.from(client);

// Structure of data that we want to read
interface Football {
    Date: string;
    Home: string;
    Away: string;
    HomeGoals: string;
    AwayGoals: string;
}

// Read file
async function readFootballData() {
    // Team we want the data for
    const team: string = 'Chelsea';

    // Track the number of entries for the team we are following
    let counter: number = 0;

    console.log("Reading Chelsea data ...");
    
    // Use async/await to handle asynchronous operations
    fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', async (data: Football) => {
            if (data.Home === team || data.Away === team) {
                // Convert date to US format
                const usDate = ukToUsDate(data.Date);

                // Change to JavaScript Date format
                const date = new Date(usDate);

                // Calculate goal difference
                const goalDifference = calculateGoalDifference(data, team);

                // Create DynamoDB PutCommand to store data
                const command = new PutCommand({
                    TableName: "FootballMatches",
                    Item: {
                        "MatchTS": date.getTime(),
                        "Score": goalDifference,
                        "TeamName": "Chelsea"
                    }
                });

                try {
                    // Store data in DynamoDB
                    const response = await docClient.send(command);
                    return response;
                } catch (err) {
                    console.error("Error saving data: ", err);
                }

                // Log out data
                // console.log(`${++counter}. UnixTime: ${date.getTime()}. ${data.Home} goals: ${data.HomeGoals}; ${data.Away} goals: ${data.AwayGoals}. Goal Difference: ${goalDifference}`);
            }
        })
        .on('end', () => {
            console.log("Data reading complete");
        });
}

// Converts UK date to US date
function ukToUsDate(date: string): string {
    // Split date
    const dateArray = date.split("-");
    // Change order of day and month and return
    return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`;
}

// Function to calculate goal difference and convert to a single number
function calculateGoalDifference(data: Football, team: string): number {
    const homeGoals = parseInt(data.HomeGoals);
    const awayGoals = parseInt(data.AwayGoals);

    if (data.Home === team) {
        // Chelsea is the home team
        return calculateSingleNumber(homeGoals - awayGoals);
    } else if (data.Away === team) {
        // Chelsea is the away team
        return calculateSingleNumber(awayGoals - homeGoals);
    } else {
        // Chelsea is not playing in this match
        return 0;
    }
}

// Function to convert goal difference to a single number
function calculateSingleNumber(goalDifference: number): number {
    if (goalDifference === 0) {
        return 0; // Draw
    } else if (goalDifference === 1) {
        return 1; // Win by one goal
    } else if (goalDifference === 2) {
        return 2; // Win by two goals
    } else if (goalDifference === 3) {
        return 3; // Win by three goals
    } else if (goalDifference === 4) {
        return 4; // Win by four goals
    } else if (goalDifference >= 5) {
        return 5; // Win by five or more goals
    } else if (goalDifference === -1) {
        return -1; // Lose by one goal
    } else if (goalDifference === -2) {
        return -2; // Lose by two goals
    } else if (goalDifference === -3) {
        return -3; // Lose by three goals
    } else if (goalDifference === -4) {
        return -4; // Lose by four goals
    } else if (goalDifference <= -5) {
        return -5; // Lose by five or more goals
    } else {
        return NaN;
    }
}

// Execute the script
readFootballData();
