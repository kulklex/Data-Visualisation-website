import axios from 'axios';


export const handler = async (event) => {
  //Extract data from event
  for(let record of event.Records){
    if(record.eventName === "INSERT"){
      //Extract data from event
      const text = record.dynamodb.NewImage.News.S;
      
      //Extract timestamp and team
      const timestamp = record.dynamodb.NewImage.MatchTS.N;
    
    //Extract team
      const team = record.dynamodb.NewImage.TeamName.S;
      
      console.log(`News: ${text} \n`);
      console.log(`Timestamp: ${timestamp}\n`);
      console.log(`Teamname: ${team}\n`);
      
      //Process news text for sentiment
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
      
      
    console.log(`Sentiment: ${response.data}\n`);
      
      //USe Wee 19 code, if you like...
      
      //HAve sentiment, team and timstamp
      //Save in new table 
      
    }
    
    
  }
  
  // TODO implement
  console.log(JSON.stringify(event));
  const response = {
    statusCode: 200,
    body: JSON.stringify('Arsenal thrash west ham!'),
  };
  return response;
};
