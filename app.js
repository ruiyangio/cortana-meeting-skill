/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

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
const cortanaTokener = axios({
    method: 'post',
    url: 'http://game.westus.cloudapp.azure.com/api/login',
    data: {
        userName: 'cortana_skill'
    }
}).then(response => {
    return response.data.token;
});

// Main dialog with LUIS
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', session => {
        session.send(
            "You reached Greeting intent, you said '%s'.",
            session.message.text
        );
    })
    .matches('Help', session => {
        session.send(
            "You reached Help intent, you said '%s'.",
            session.message.text
        );
    })
    .matches('Cancel', session => {
        const messageText = session.message.text;

        if (messageText.includes('get game')) {
            cortanaTokener.then(token => {
                axios({
                    method: 'get',
                    url: 'http://game.westus.cloudapp.azure.com/api/games',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    session.send(JSON.stringify(response.data));
                });
            });
        } else if (messageText.includes('clean games')) {
            cortanaTokener.then(token => {
                axios({
                    method: 'PUT',
                    url:
                        'http://game.westus.cloudapp.azure.com/admin/cleangames',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: {
                        cred: 'ray'
                    }
                }).then(response => {
                    session.send('Games are cleaned');
                });
            });
        } else if (messageText.includes('clean users')) {
            cortanaTokener.then(token => {
                axios({
                    method: 'PUT',
                    url:
                        'http://game.westus.cloudapp.azure.com/admin/cleanusers',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: {
                        cred: 'ray'
                    }
                }).then(response => {
                    session.send('Users are cleaned');
                });
            });
        } else {
            session.send(
                "You reached Cancel intent, you said '%s'.",
                session.message.text
            );
        }
    })
    /*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
    .onDefault(session => {
        session.send("Sorry, I did not understand '%s'.", session.message.text);
    });

bot.dialog('/', intents);
