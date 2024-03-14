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
const fs_1 = require("fs");
function downloadDataAndSaveToFile() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://y2gtfx0jg3.execute-api.us-east-1.amazonaws.com/prod/M00919866');
            // The response data is automatically converted to JSON, so no need to call .json()
            const data = response.data;
            // Convert the JSON object to a string with pretty print
            const dataStr = JSON.stringify(data, null, 2);
            // Write the string to a file named data.json
            yield fs_1.promises.writeFile('syntheticData.json', dataStr, 'utf8');
            console.log('Data saved to data.json');
        }
        catch (error) {
            console.error('Error downloading or saving the data:', error);
        }
    });
}
downloadDataAndSaveToFile();
