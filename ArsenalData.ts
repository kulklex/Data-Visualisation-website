// File locations
const csvFile: string = "premier-league-matches.csv";

// Node modules
import csv from 'csv-parser';
import fs from 'fs';

// Structure of data that we want to read
interface Football {
    Date: string;
    Home: string;
    Away: string;
    HomeGoals: string;
    AwayGoals: string;
}

// Read file
function readFootballData() {
    // Team we want the data for
    const team: string = 'Arsenal';

    // Track the number of entries for the team we are following
    let counter: number = 0;

    console.log("Reading football data ...");
    fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (data: Football) => {
            if (data.Home === team || data.Away === team) {
                // Only process matches where Arsenal is playing
                // Convert date to US format
                const usDate = ukToUsDate(data.Date);

                // Change to JavaScript Date format
                const date = new Date(usDate);

                // Calculate goal difference
                const goalDifference = calculateGoalDifference(data, team);

                // Log out data
                console.log(`${++counter}. UnixTime: ${date.getTime()}. ${data.Home} goals: ${data.HomeGoals}; ${data.Away} goals: ${data.AwayGoals}. Goal Difference: ${goalDifference}`);

                // Convert score to single number and store data in DynamoDB
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
        // Arsenal is the home team
        return calculateSingleNumber(homeGoals - awayGoals);
    } else if (data.Away === team) {
        // Arsenal is the away team
        return calculateSingleNumber(awayGoals - homeGoals);
    } else {
        // Arsenal is not playing in this match
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
        return 11; // Lose by one goal
    } else if (goalDifference === -2) {
        return 12; // Lose by two goals
    } else if (goalDifference === -3) {
        return 13; // Lose by three goals
    } else if (goalDifference === -4) {
        return 14; // Lose by four goals
    } else if (goalDifference <= -5) {
        return 15; // Lose by five or more goals
    } else {
        return NaN;
    }
}

// Execute the script
readFootballData();
