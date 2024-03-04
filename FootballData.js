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
// All football teams
const FootballTeams = ["Arsenal", "Chelsea", "Manchester City", "Manchester Utd", "Liverpool"];
// Read file
function readAndStoreFootballData() {
    return __awaiter(this, void 0, void 0, function* () {
        // Team we want the data for
        console.log("Reading data ...");
        // Store all the data from the csv file here
        let csvData = [];
        // Use async/await to handle asynchronous operations
        fs_1.default.createReadStream(csvFile)
            .pipe((0, csv_parser_1.default)())
            .on('data', (footballData) => __awaiter(this, void 0, void 0, function* () {
            csvData.push(footballData);
        }))
            .on('end', () => __awaiter(this, void 0, void 0, function* () {
            for (const data of csvData) {
                yield addData(data);
                yield addData(data, false);
            }
        }));
    });
}
// Function to add data to DynamoDB
function addData(data, home = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const team = data[home ? 'Home' : 'Away'];
        if (FootballTeams.includes(team)) {
            // Convert date to US format
            const usDate = ukToUsDate(data.Date);
            // // Change to JavaScript Date format
            const date = new Date(usDate);
            // Calculate goal difference
            const goalDifference = calculateGoalDifference(data, team);
            // Create DynamoDB PutCommand to store data
            const command = new lib_dynamodb_1.PutCommand({
                TableName: "FootballMatches",
                Item: {
                    "MatchTS": date.getTime(),
                    "Score": goalDifference,
                    "TeamName": team
                }
            });
            try {
                // Store data in DynamoDB
                yield docClient.send(command);
                console.log(team + " updated");
            }
            catch (err) {
                console.error("Error saving data: ", err);
            }
        }
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
        // Selected Club is the home team
        return calculateSingleNumber(homeGoals - awayGoals);
    }
    else if (data.Away === team) {
        // Selected Club is the away team
        return calculateSingleNumber(awayGoals - homeGoals);
    }
    else {
        // Selected Club is not playing in this match
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
readAndStoreFootballData();
