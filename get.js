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
exports.main = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Configure AWS DynamoDB client
const client = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }); //  AWS region
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const command = new lib_dynamodb_1.GetCommand({
        TableName: "FootballMatches",
        Key: {
            TeamName: "Arsenal",
            MatchTS: 65547646576
        },
    });
    const response = yield docClient.send(command);
    console.log(response);
    return response;
});
exports.main = main;
(0, exports.main)();
