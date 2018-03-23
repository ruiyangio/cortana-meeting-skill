const constants = require('../constants');
const restClient = require('../util/rest-client');
const dateUtil = require('../util/date-util');
const logger = require('../middlewares/request-logger-middleware');

const USER_ACCOUNTS = constants.USER_ACCOUNTS;

function scheduleMeeting(args) {
    let payload = {
        Subject: args.subject,
        Body: {
            ContentType: 'HTML',
            Content: args.meetingContent
        },
        Start: {
            DateTime: dateUtil.convertToODataFormat(args.startDateTime),
            TimeZone: 'Pacific Standard Time'
        },
        End: {
            DateTime: dateUtil.convertToODataFormat(args.endDateTime),
            TimeZone: 'Pacific Standard Time'
        },
        Attendees: [],
        Location: {},
        Locations: []
    };

    if (args.attendees) {
        for (let i = 0; i < args.attendees.length; i++) {
            let attendee = args.attendees[i];
            let emailAddress =
                args.mailBox == constants.MAILBOX.WORK
                    ? USER_ACCOUNTS[attendee].WORK_EMAIL_ID
                    : USER_ACCOUNTS[attendee].PERSONAL_EMAIL_ID;
            payload.Attendees.push({
                EmailAddress: {
                    Address: emailAddress,
                    Name: USER_ACCOUNTS[attendee].NAME
                },
                Type: 'Required'
            });
        }
    }

    if (args.location) {
        payload.Location = args.location;
        payload.Locations.push(args.location);
    }

    let url =
        constants.URLS.BASE_SCHEDULE_MEETING_URL + args.calendarId + '/events';

    logger.log(url, 'URL');
    logger.log(payload, 'PAYLOAD');

    return restClient.postCall(url, payload, args.token);
}

module.exports = {
    scheduleMeeting: scheduleMeeting
};
