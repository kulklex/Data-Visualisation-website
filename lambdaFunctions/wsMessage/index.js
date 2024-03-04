//Import external library with websocket functions
import { sendMessage } from './websocket.mjs'
import { getData } from './database.mjs';

export const handler = async (event) => {
    //console.log(JSON.stringify(event));
    try {
        //Get connection ID from event
        let connId = event.requestContext.connectionId;
        
        const data = await getData();

        //Extract domain and stage from event
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        console.log("Domain: " + domain + " stage: " + stage);

        //Get promises to send messages to connected clients
        let result = await sendMessage(JSON.stringify(data), connId, domain, stage);
        console.log(JSON.stringify(result));
    }
    catch(err){
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};
