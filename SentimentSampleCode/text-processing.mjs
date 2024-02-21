/* Sentiment analysis using text-processing web service:http://text-processing.com/docs/sentiment.html
    Note that this is rate-limited to 1000 requests per IP address per day.
    Lambda functions use multiple IP addresses, so this should not be an issue for this project. */

//Axios handles HTTP requests to web service
import axios from 'axios';

// Calls text-processing web service and logs sentiment.
export async function tpSentiment(text){
    //URL of web service
    let url = `http://text-processing.com/api/sentiment/`;

    //Sent GET to endpoint with Axios
    let response = await axios.post(url, {
            text: text
        },{
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    //Log result
    console.log(`Text: ${text}.`);
    console.log(response.data);

    /* Result should look like this:
    {
        probability: {
            neg: 0.1872928115582888,
            neutral: 0.15443303555355006,
            pos: 0.8127071884417112
        },
        label: 'pos'
    } */
}


