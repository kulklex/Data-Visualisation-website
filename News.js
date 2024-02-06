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
exports.makeApiCall = void 0;
// Import axios library for making HTTP requests
const axios_1 = __importDefault(require("axios"));
// Import dotenv for loading environment variables from a .env file
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from a .env file
dotenv_1.default.config();
// The base URL for the News API
const apiUrl = 'https://newsapi.org/v2/everything';
// Function to create dynamic API parameters
let createApiParams = (query) => ({
    q: query,
    sortBy: 'popularity',
    language: 'en',
    apiKey: 'bc1697d5f460435fbf9be668688ee620', // API key 
});
// Function to make an API call
const makeApiCall = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Create dynamic parameters based on the query
        const params = createApiParams(query);
        // Make a GET request using axios
        const response = yield axios_1.default.get(apiUrl, { params });
        // Handle the API response
        console.log('API Response:', (_a = response.data) === null || _a === void 0 ? void 0 : _a.articles);
        // Get the total number of articles
        console.log("\n" + ((_b = response.data) === null || _b === void 0 ? void 0 : _b.articles.length));
    }
    catch (error) {
        // Handle errors
        console.error('Error:', error);
    }
});
exports.makeApiCall = makeApiCall;
// Example API calls for different football teams
(0, exports.makeApiCall)("Arsenal FC");
(0, exports.makeApiCall)("Chelsea FC");
(0, exports.makeApiCall)("Liverpool FC");
(0, exports.makeApiCall)("Manchester United");
(0, exports.makeApiCall)("Manchester City FC");
