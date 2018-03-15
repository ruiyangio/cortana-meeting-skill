const restify = require('restify');
const builder = require('botbuilder');
const botbuilder_azure = require('botbuilder-azure');
const axios = require('axios');

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

const tableName = 'botdata';
const azureTableClient = new botbuilder_azure.AzureTableClient(
    tableName,
    process.env['AzureWebJobsStorage']
);
const tableStorage = new botbuilder_azure.AzureBotStorage(
    { gzipData: false },
    azureTableClient
);

// Create your bot with a function to receive messages from the user
const bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
const luisAppId = process.env.LuisAppId;
const luisAPIKey = process.env.LuisAPIKey;
const luisAPIHostName =
    process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl =
    'https://' +
    luisAPIHostName +
    '/luis/v1/application?id=' +
    luisAppId +
    '&subscription-key=' +
    luisAPIKey;

// Main dialog with LUIS
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Meeting.Add', (session, args) => {
        session.say(JSON.stringify(args), 'I found the entities');
    })
    .onDefault((session, args) => {
        console.log(session.message);
        session.send("Sorry, I did not understand '%s'.", session.message.text);
    });

bot.dialog('/', intents);
