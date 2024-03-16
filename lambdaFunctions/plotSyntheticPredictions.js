import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime"; 

const client = new SageMakerRuntimeClient({region: "us-east-1"});


//Authentication details for Plotly
//ADD YOUR OWN AUTHENTICATION DETAILS
const PLOTLY_USERNAME = 'kulklex';
const PLOTLY_KEY = 'Hd3e6pjoHRW6ZHqhMP9q';

//Initialize Plotly with user details.
import Plotly from 'plotly';
let plotly = Plotly(PLOTLY_USERNAME, PLOTLY_KEY);



export const handler = async (event) => {
    try {
        //Get synthetic data
        const results  = await invokeEndpoint();
        let yValues = [];
        //Add basic X values for plot
        let xValues = [];
        results?.map(result => {
                yValues.push(result);
        });
        
        for(let i=0; i<yValues.length; ++i){
            xValues.push(i);
        }

        //Call function to plot data
        let plotResult = await plotData(xValues, yValues);
        console.log("Plot for predicted synthetic data'" + "' available at: " + plotResult.url);

        return {
            statusCode: 200,
            body: "Ok"
        };
    }
    catch (err) {
        console.log("ERROR: " + err);
        return {
            statusCode: 500,
            body: "Error plotting predicted synthetic data"
        };
    }
};


//Plots the specified data
async function plotData(xValues, yValues){
    //Data structure
    let syntheticData = {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: 'line',
        name: "Predicted Synthetic Data",
        marker: {
            color: 'rgb(219, 64, 82)',
            size: 12
        }
    };
    let data = [syntheticData];

    //Layout of graph
    let layout = {
        title: "Predicted Synthetic Data",
        font: {
            size: 25
        },
        xaxis: {
            title: 'Time (hours)'
        },
        yaxis: {
            title: 'Value'
        }
    };
    let graphOptions = {
        layout: layout,
        filename: "date-axes",
        fileopt: "overwrite"
    };

    //Wrap Plotly callback in a promise
    return new Promise ( (resolve, reject)=> {
        plotly.plot(data, graphOptions, function (err, msg) {
            if (err)
                reject(err);
            else {
                resolve(msg);
            }
        });
    });
}




// Data endpoint is receiving
const endpointData = {
    "instances": [
        {
            "start":"2024-04-26 17:00:00",
            "target": [298.6503780343599,310.1735539288901,294.8753121859775,290.54289934769565,312.0933191865694,290.1542013287784,297.0526165484505,324.7192209877969,308.7223635780979,320.67785011047476,347.4760814294298,346.1395039101237,345.7455713149254,358.64421297715205,331.5137718297724,348.8584636766919,346.03635089465797,348.9168976872319,346.5002811101462,340.97877638361285,333.97738393007063,328.28617020163193,329.3213177054614,325.5200704133475,311.14867014759716,297.0079763364924,295.58080381580146,305.7003322732826,306.16445446881124,327.86211821506515,327.054698196454,330.4076947318139,321.08965513851626,335.6762830824902,357.3645959345134,361.8601436338887,363.82816082974455,359.03505498302684,373.27083056478335,345.5463508916085,356.00342106801247,343.5625812653829,342.39225375349656,351.79453492506906,355.3268140001374,337.79423153727714,337.817115640335,336.1512158264881,317.50685325205285,310.39430716012004,318.5954190235826,319.6494893000194,330.13323135561933,340.6127171580505,331.56986843533394,330.02653363602377,343.67100674593706,336.13671591893717,352.1166951503039,364.61124818771646,352.81746983297364,372.01009534589826,363.86376256802447,386.2841295001121,369.3769794992507,382.02924231708835,370.3822410270445,373.62713857248156,339.4537180890658,357.2039457165678,330.841294703828,349.4422472922565,332.9747246393909,323.76442469608315,323.52210158333185,329.6567485481205,323.58641258477235,331.2284403724072,334.6141136433669,345.3081990742722,371.2581877176541,381.78907421203627,359.9093881935707,373.1175663097968,364.87327903658746,396.08216028676964,376.93202717238825,388.65469139676964,395.86556740368746,377.4633561378906,380.7434383891862,362.0850422350916,383.7084814523818,377.4816615483313,367.74040121678706,356.3198734794538,354.8447161138645,340.75300263094584,343.3131420458234,359.6503996422226]
        }
    ],
    "configuration": {
        "num_samples": 50,
        "output_types": ["mean"],
        "quantiles": ["0.1", "0.9"]
    }
};

async function invokeEndpoint () {
    const command = new InvokeEndpointCommand({
        EndpointName: "SyntheticDataEndpoint",
        Body: JSON.stringify(endpointData),
        ContentType: "application/json",
        Accept: "application/json"
    });
    
   
    const response = await client.send(command);

    // Parse the response body from binary format to a string, then to a JavaScript object
    let predictions = JSON.parse(Buffer.from(response.Body).toString('utf8'));
    
    return predictions.predictions[0].mean;
}