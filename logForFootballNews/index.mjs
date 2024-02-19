export const handler = async (event) => {
    //Extract data from event
    for(let record of event.Records){
      if(record.eventName === "INSERT"){
        //Extract data from event
        const text = record.dynamodb.NewImage.News.S;
        //Extract timestamp and team
        console.log(`News: ${text}`);
        
        //Process news text for sentiment
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