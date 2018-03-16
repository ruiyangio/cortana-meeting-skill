const restify = require('restify');
const builder = require('botbuilder');
const botbuilder_azure = require('botbuilder-azure');
const axios = require('axios');
const conversationStateService = require('./bot/services/conversation-state-service');

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

const LuisModelUrl = `https://${luisAPIHostName}/luis/v1/application?id=${luisAppId}&subscription-key=${luisAPIKey}`;

const mockUpData = {
    freeTimes: 'You have free times today from 3:00pm to 4:00pm'
};

// Main dialog with LUIS
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Meeting.Add', conversationStateService.handleMissingDataQuery)
    .matches('Meeting.Subject', conversationStateService.handleMissingDataQuery)
    .matches('Meeting.Person', conversationStateService.handleMissingDataQuery)
    .matches(
        'Meeting.Duration',
        conversationStateService.handleMissingDataQuery
    )
    .matches(
        'Meeting.Location',
        conversationStateService.handleMissingDataQuery
    )
    .matches('Meeting.Date', conversationStateService.handleMissingDataQuery)
    .matches('Calendar.Availability', (session, args, next) => {
        session.say('I found free times', mockUpData.freeTimes);
    })
    .matches('Confirm.Positive', (session, args, next) => {
        const meetingState = conversationStateService.getMeetingState(
            session,
            args.entities
        );

        if (!conversationStateService.isMeetingValid(meetingState)) {
            session.say('How can I help you?', 'How can I help you?');
        } else {
            conversationStateService.removeMeetingState();
            session.say('Meeting confirmed', 'Meeting is scheduled');
            session.endConversation('Meeting confirmed');
        }
    })
    .matches('Confirm.Negative', (session, args, next) => {
        const meetingState = conversationStateService.getMeetingState(
            session,
            args.entities
        );

        if (!conversationStateService.isMeetingValid(meetingState)) {
            session.say('How can I help you?', 'How can I help you?');
        } else {
            session.say('How can I help you?', 'How can I help you?');
        }
    })
    .matches('EndSkill', (session, args, next) => {
        session.endConversation();
    })
    .onDefault((session, args, next) => {
        session.send("Sorry, I did not understand '%s'.", session.message.text);
    });

bot.dialog('/', intents);
