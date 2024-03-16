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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const date_fns_1 = require("date-fns");
// AWS DynamoDB imports
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Configure AWS DynamoDB client
const client = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }); // AWS region
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
// Process and save data for each team
function processAndSaveDataByTeam() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const matchResults = yield getMatchResults();
            const groupedResults = groupByTeam(matchResults);
            for (const teamName in groupedResults) {
                const teamResults = groupedResults[teamName];
                const teamData = {
                    start: teamResults.map(result => timestampToDate(result.MatchTS)),
                    target: teamResults.map(result => result.Score),
                };
                // Create a single JSON object for the team
                const dataStr = JSON.stringify(teamData, null, 2);
                // Create files using this naming convention
                const fileName = `team_${teamName.replace(/\s+/g, '_')}.json`;
                yield fs_1.promises.writeFile(fileName, dataStr, 'utf8');
                console.log(`Processed data for ${teamName} saved to ${fileName}`);
            }
        }
        catch (error) {
            console.error('Error processing or saving the data by team:', error);
        }
    });
}
// Returns all of the match results
function getMatchResults() {
    return __awaiter(this, void 0, void 0, function* () {
        const scanCommand = new lib_dynamodb_1.ScanCommand({
            TableName: "FootballMatches",
        });
        const response = yield docClient.send(scanCommand);
        return response.Items;
    });
}
// Function to group match results by team
function groupByTeam(matchResults) {
    return matchResults.reduce((acc, matchResult) => {
        const { TeamName } = matchResult;
        if (!acc[TeamName]) {
            acc[TeamName] = [];
        }
        acc[TeamName].push(matchResult);
        return acc;
    }, {});
}
// Convert timestamp to formatted date string
function timestampToDate(timestamp) {
    return (0, date_fns_1.format)(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
}
processAndSaveDataByTeam();
