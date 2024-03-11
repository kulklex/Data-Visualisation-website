//Import external library with websocket functions
import { sendMessage } from './websocket.mjs'
import { getData, getSentiments } from './database.mjs';

export const handler = async (event) => {
    console.log(JSON.stringify(event));
    try {
        //Get connection ID from event
        let connId = event.requestContext.connectionId;

        // Extract team name from the incoming message
        const body = JSON.parse(event.body);
        const teamName = body.data;

        // Using team name sent from the clientside
        const requestId = teamName;

        // Fetch data based on the team name
        const data = await getData(teamName);
        const sentiments = await getSentiments(teamName);

        //Extract domain and stage from event
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        console.log("Domain: " + domain + " stage: " + stage);

        //Get promises to send the data and the requestId to connected clients
        let result = await sendMessage(JSON.stringify({ ...data, id: requestId, sentiments }), connId, domain, stage);
        console.log(JSON.stringify(result));
    }
    catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};
