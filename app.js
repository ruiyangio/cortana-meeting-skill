const constants = require('./bot/constants');
const restify = require('restify');
const builder = require('botbuilder');
const botbuilder_azure = require('botbuilder-azure');
const conversationStateService = require('./bot/services/conversation-state-service');
const tokenService = require('./bot/services/token-service');
const persona = require('./bot/services/persona-controller');
const adaptiveCardService = require('./bot/services/adaptive-card-service');
const geoLocations = require('./bot/util/location-finder');

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

// Main dialog with LUIS
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Meeting.Add', [
        tokenService.promptSignin,
        conversationStateService.handleMissingDataQuery
    ])
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
    .matches('Meeting.Type', conversationStateService.handleMissingDataQuery)
    .matches('Meeting.Date', conversationStateService.handleMissingDataQuery)
    .matches('Calendar.Availability', [
        tokenService.promptSignin,
        (session, args, next) => {
            // const dateScope = conversationStateService.getFreeTimeScope(
            //     args.entities
            // );
            if (!session.privateConversationData.meetingState) {
                session.privateConversationData.meetingState = {};
                session.privateConversationData.meetingState.mockStartDates =
                    conversationStateService.mockStartDates;
            }
            const meetingState = session.privateConversationData.meetingState;
            session.send(
                adaptiveCardService.createAvailableTimeMessage(
                    session,
                    meetingState.mockStartDates[0].display
                )
            );
        }
    ])
    .matches('Confirm.Positive', (session, args, next) => {
        const meetingState = conversationStateService.getMeetingState(
            session,
            args.entities
        );

        if (!conversationStateService.isMeetingValid(meetingState)) {
            session.say('How can I help you?', 'How can I help you?');
        } else {
            const meetingState = session.privateConversationData.meetingState;
            // Mock up the conflict
            if (meetingState.mockStartDates[0].display === 'Today 4:00 pm') {
                session.say(
                    'Location conflict',
                    'You have a previous meeting at Seattle. Do you want to set this meeting as Skype meeting instead?'
                );
            } else {
                persona
                    .scheduleMeeting(
                        meetingState.type,
                        constants.USERS.rui,
                        [constants.USERS[meetingState.person]],
                        meetingState.mockStartDates[0].start,
                        meetingState.mockStartDates[0].end,
                        meetingState.subject,
                        geoLocations[meetingState.location]
                    )
                    .then(res => {
                        meetingState.mockStartDates.shift();
                        conversationStateService.removeMeetingState(session);
                        session.say(
                            'Meeting confirmed',
                            'Meeting is scheduled'
                        );
                    })
                    .catch(error => {
                        session.say(
                            'Meeting confirmed',
                            'Something is wrong when talking to Utah.'
                        );
                    });
            }
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
            const meetingState = session.privateConversationData.meetingState;
            meetingState.mockStartDates.shift();
            session.say(
                'Do you want to schedule the meeting to another time?',
                `Do you want to schedule the meeting at ${
                    meetingState.mockStartDates[0].display
                }?`
            );
        }
    })
    .matches('EndSkill', (session, args, next) => {
        session.endConversation();
    })
    .onDefault([
        tokenService.promptSignin,
        (session, args, next) => {
            session.send(`Sorry, I did not understand ${session.message.text}`);
        }
    ]);

bot.dialog('/', intents);
