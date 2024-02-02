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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiUrl = 'https://newsapi.org/v2/everything';
let createApiParams = (query) => ({
    q: query,
    sortBy: 'popularity',
    language: 'en',
    apiKey: 'bc1697d5f460435fbf9be668688ee620',
});
// Make API call
const makeApiCall = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // A dynamic parameters based on the query
        const params = createApiParams(query);
        // GET request using axios
        const response = yield axios_1.default.get('https://newsapi.org/v2/everything', { params });
        // Handle the API response
        console.log('API Response:', (_a = response.data) === null || _a === void 0 ? void 0 : _a.articles);
        // Get the total number of articles
        console.log("\n" + ((_b = response.data) === null || _b === void 0 ? void 0 : _b.articles.length));
    }
    catch (error) {
        console.error('Error:', error);
    }
});
makeApiCall("Arsenal FC");
makeApiCall("Chelsea FC");
makeApiCall("Liverpool FC");
makeApiCall("Manchester United");
makeApiCall("Manchester City FC");
