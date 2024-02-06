"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// File locations
const csvFile = "premier-league-matches.csv";
// Node modules
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
// AWS DynamoDB imports
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Configure AWS DynamoDB client
const client = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
// Read file
function readFootballData() {
    return __awaiter(this, void 0, void 0, function* () {
        // Team we want the data for
        const team = 'Arsenal';
        // Track the number of entries for the team we are following
        let counter = 0;
        console.log("Reading Arsenal data ...");
        // Use async/await to handle asynchronous operations
        yield fs_1.default.createReadStream(csvFile)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => __awaiter(this, void 0, void 0, function* () {
            if (data.Home === team || data.Away === team) {
                // Convert date to US format
                const usDate = ukToUsDate(data.Date);
                // Change to JavaScript Date format
                const date = new Date(usDate);
                // Calculate goal difference
                const goalDifference = calculateGoalDifference(data, team);
                // Create DynamoDB PutCommand to store data
                const command = new lib_dynamodb_1.PutCommand({
                    TableName: "FootballMatches",
                    Item: {
                        "MatchTS": date.getTime(),
                        "Score": goalDifference,
                        "TeamName": "Arsenal"
                    }
                });
                try {
                    // Store data in DynamoDB
                    const response = yield docClient.send(command);
                    return response;
                }
                catch (err) {
                    console.error("Error saving data: ", err);
                }
                // Log out data
                // console.log(`${++counter}. UnixTime: ${date.getTime()}. ${data.Home} goals: ${data.HomeGoals}; ${data.Away} goals: ${data.AwayGoals}. Goal Difference: ${goalDifference}`);
            }
        }))
            .on('end', () => {
            console.log("Data reading complete");
        });
    });
}
// Converts UK date to US date
function ukToUsDate(date) {
    // Split date
    const dateArray = date.split("-");
    // Change order of day and month and return
    return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`;
}
// Function to calculate goal difference and convert to a single number
function calculateGoalDifference(data, team) {
    const homeGoals = parseInt(data.HomeGoals);
    const awayGoals = parseInt(data.AwayGoals);
    if (data.Home === team) {
        // Arsenal is the home team
        return calculateSingleNumber(homeGoals - awayGoals);
    }
    else if (data.Away === team) {
        // Arsenal is the away team
        return calculateSingleNumber(awayGoals - homeGoals);
    }
    else {
        // Arsenal is not playing in this match
        return 0;
    }
}
// Function to convert goal difference to a single number
function calculateSingleNumber(goalDifference) {
    if (goalDifference === 0) {
        return 0; // Draw
    }
    else if (goalDifference === 1) {
        return 1; // Win by one goal
    }
    else if (goalDifference === 2) {
        return 2; // Win by two goals
    }
    else if (goalDifference === 3) {
        return 3; // Win by three goals
    }
    else if (goalDifference === 4) {
        return 4; // Win by four goals
    }
    else if (goalDifference >= 5) {
        return 5; // Win by five or more goals
    }
    else if (goalDifference === -1) {
        return -1; // Lose by one goal
    }
    else if (goalDifference === -2) {
        return -2; // Lose by two goals
    }
    else if (goalDifference === -3) {
        return -3; // Lose by three goals
    }
    else if (goalDifference === -4) {
        return -4; // Lose by four goals
    }
    else if (goalDifference <= -5) {
        return -5; // Lose by five or more goals
    }
    else {
        return NaN;
    }
}
// Execute the script
readFootballData();
