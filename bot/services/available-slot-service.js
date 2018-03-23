const restClient = require('../util/rest-client.js');
const constants = require('../constants.js');
const logger = require('../middlewares/request-logger-middleware');
const dateUtil = require('../util/date-util');

const URLS = constants.URLS;
const USER_ACCOUNTS = constants.USER_ACCOUNTS;
const USERS = constants.USERS;

/**
 * Calls findMeetingTimes api for getting available slots
 * @param {string} token the OAuth token
 * @param {[constants.USERS]} attendees the array of attendees. Use constants.USERS options.
 * @param {Date} startDateTime start of the time range for lookup.
 * @param {Date} endDateTime end of the time range for lookup.
 * @returns a promise with the response of the called API.
 */
function findMeetingTimes(token, attendees, startDateTime, endDateTime) {
    let payLoad = {
        Attendees: [],
        TimeConstraint: {
            ActivityDomain: 'Work',
            Timeslots: [
                {
                    Start: {
                        DateTime: '',
                        TimeZone: 'Pacific Standard Time'
                    },
                    End: {
                        DateTime: '',
                        TimeZone: 'Pacific Standard Time'
                    }
                }
            ]
        },
        MeetingDuration: 'PT1H'
    };

    payLoad['TimeConstraint']['Timeslots'][0]['Start'][
        'DateTime'
    ] = `2018-${startDateTime.getMonth() +
        1}-${startDateTime.getDate()}T07:00:00`;
    payLoad['TimeConstraint']['Timeslots'][0]['End'][
        'DateTime'
    ] = `2018-${endDateTime.getMonth() + 1}-${endDateTime.getDate()}T17:00:00`;

    for (let i = 0; i < attendees.length; i++) {
        let userAccount = USER_ACCOUNTS[attendees[i]];

        payLoad['Attendees'].push({
            Type: 'Required',
            EmailAddress: {
                Name: userAccount.NAME,
                Address: userAccount.WORK_EMAIL_ID
            }
        });
    }

    return restClient.postCall(URLS.FIND_MEETING_TIME, payLoad, token);
}

/**
 * Calls getEvent API using calendar id.
 * @param {string} token the OAuth token to be used for the service call.
 * @param {string} calendarId the calendar id to be used for lookup.
 * @param {Date} startDateTime start of the time range for lookup.
 * @param {Date} endDateTime end of the time range for lookup.
 * @returns a promise with the response of the API call.
 */
function getEvents(token, calendarId, startDateTime, endDateTime) {
    let startDate = dateUtil.convertToODataFormat(startDateTime);
    let endDate = dateUtil.convertToODataFormat(endDateTime);

    let url =
        URLS.BASE_GET_CALENDAR_VIEW +
        calendarId +
        '/calendarview?startDateTime=' +
        startDate +
        '&endDateTime=' +
        endDate;

    logger.log(url, 'URL');
    logger.log(token, 'TOKEN');

    return restClient.getCall(url, token);
}

module.exports = {
    findMeetingTimes: findMeetingTimes,
    getEvents: getEvents
};
