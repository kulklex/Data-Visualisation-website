/* Sentiment analysis using the natural module.
    See: https://naturalnode.github.io/natural/sentiment_analysis.html
*/

//Import natural module
import  natural  from 'natural';

//Create analyzer
const analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");

//Uses natural module for sentiment analysis and outputs results.
export function naturalSentiment(text){
    //Split text into an array
    const wordArray = text.split(" ");

    //Get sentiment. s>0 & s<=1: positive text; s>=-1 & s<0: negative text; 0: neutral
    const sentiment = analyzer.getSentiment(wordArray);

    //Log out result
    console.log(`Sentiment: ${sentiment}. Text: "${text}"`);
}
