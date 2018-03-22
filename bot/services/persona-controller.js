const availableSlotService = require('./available-slot-service');
const meetingSchedulerService = require('./meeting-scheduler-service');
const constants = require('../constants');
const tokenService = require('./token-service');
const logger = require('../middlewares/request-logger-middleware');

const tokenCache = tokenService.getTokens();
const USERS = constants.USERS;
const USER_ACCOUNTS = constants.USER_ACCOUNTS;

/**
 * Gets the first avaiable time for an user based on the start date time provided.
 * @param {String} user  the user logged in for cortana call. Use constant.USERS options.
 * @param {Date} startDateTime  Represents the start date time.
 * @param {Date} startDateTime  Represents the start date time.
 * @returns a Promise which will contain the first avaialbe slot starting from the given start date time
 */
function getPersonalAvailability(user, startDateTime, endDateTime) {
    return _getPersonalAvailability(user, startDateTime, endDateTime);
}

function _getPersonalAvailability(
    user,
    startDateTime,
    endDateTime,
    durationInMins = 0
) {
    let attendeeCalAssciation = [];
    attendeeCalAssciation.push({
        user: user,
        mailbox: constants.MAILBOX.WORK
    });

    attendeeCalAssciation.push({
        user: user,
        mailbox: constants.MAILBOX.PERSONAL
    });

    let availableSlots = [];
    return _getAvailableTimeForPersonalEvent(
        attendeeCalAssciation,
        startDateTime,
        endDateTime,
        durationInMins,
        availableSlots,
        0,
        0
    );
}

/**
 * Gets the common free time for scheduling meeting among the attendees.
 * @param {Date} startDateTime the start date time of the time range to look for available slots for meetings.
 * @param {number} durationInMins the duratuion of the meeting in minutes.
 * @param {[constant.USERS]} attendees the array of attendees. Use constants.USERS options for registerd attendees.
 * @param {constant.MAILBOX} mailBox type of mailbox to schedule meeting. Use constants.MAILBOX options.
 * @returns the first available slot whih is common to all the attendees.
 */
function getNextAvailableMeetingTime(
    startDateTime,
    durationInMins,
    attendees,
    mailBox = constants.MAILBOX.WORK
) {
    let endDateTime = new Date(startDateTime.getTime());
    endDateTime.setDate(startDateTime.getDate() + 1);

    if (mailBox == constants.MAILBOX.WORK) {
        logger.log('computing time for work event');

        return _getAvailableTimeForWorkEvent(
            startDateTime,
            endDateTime,
            durationInMins,
            attendees
        );
    } else {
        logger.log('computing time for personal event');

        let attendeeCalAssciation = [];
        for (let i = 0; i < attendees.length; i++) {
            attendeeCalAssciation.push({
                user: attendees[i],
                mailbox: constants.MAILBOX.PERSONAL
            });
        }

        let availableSlots = [];
        return _getAvailableTimeForPersonalEvent(
            attendeeCalAssciation,
            startDateTime,
            endDateTime,
            durationInMins,
            availableSlots,
            0,
            0
        );
    }
}

function _getAvailableTimeForWorkEvent(
    startDateTime,
    endDateTime,
    durationInMins,
    attendees
) {
    return availableSlotService
        .findMeetingTimes(
            tokenCache.work,
            attendees,
            startDateTime,
            endDateTime
        )
        .then(function(response) {
            let result = _getAvailableSlotsFromMeetingTimes(response, true);
            return result;
        })
        .catch(function(error) {
            logger.log(error['response']['status']);
            logger.log(error['response']['statusText']);
        });
}

function _getAvailableSlotsFromMeetingTimes(response, oneSlotOnly = false) {
    let meetingTimes = response['MeetingTimeSuggestions'];
    let availableSlots = [];
    for (let i = 0; i < meetingTimes.length; i++) {
        if (meetingTimes[i]['Confidence'] == 100) {
            availableSlots.push({
                start: meetingTimes[i]['MeetingTimeSlot']['Start']['DateTime'],
                end: meetingTimes[i]['MeetingTimeSlot']['End']['DateTime']
            });
        }

        if (oneSlotOnly) {
            return availableSlots;
        }
    }

    return availableSlots;
}

function _getAvailableTimeForPersonalEvent(
    attendeeCalAssciation,
    startDateTime,
    endDateTime,
    durationInMins,
    availableSlots,
    attendeeIdx,
    slotIdx
) {
    if (attendeeIdx == attendeeCalAssciation.length) {
        return Promise.reject();
    }

    let userAccount = USER_ACCOUNTS[attendeeCalAssciation[attendeeIdx]['user']];
    let token = '';
    let calendarId = '';

    if (
        attendeeCalAssciation[attendeeIdx]['mailbox'] == constants.MAILBOX.WORK
    ) {
        // looking at the work account.
        token = tokenCache.work;
        calendarId = userAccount['WORK_CALENDAR_ID'];
    } else {
        // looking at the personal account.
        token = tokenCache.personal;
        calendarId = userAccount['PERSONAL_CALENDAR_ID'];
    }

    return availableSlotService
        .getEvents(token, calendarId, startDateTime, endDateTime)
        .then(function(response) {
            availableSlots[slotIdx] = _calculateAvailableSlots(
                response,
                startDateTime,
                endDateTime
            );

            if (attendeeIdx + 1 < attendeeCalAssciation.length) {
                return _getAvailableTimeForPersonalEvent(
                    attendeeCalAssciation,
                    startDateTime,
                    endDateTime,
                    durationInMins,
                    availableSlots,
                    attendeeIdx + 1,
                    slotIdx + 1
                );
            }
            if (attendeeIdx + 1 == attendeeCalAssciation.length) {
                let result = _findCommonAvailableSlot(
                    availableSlots,
                    durationInMins
                );

                return result;
            }
        })
        .catch(function(error) {
            // use the existing logger api
            logger.log(error['response']['status']);
            logger.log(error['response']['statusText']);
        });
}

function _calculateAvailableSlots(response, startDateTime, endDateTime) {
    let events = _getEventsFromCalanderView(response);

    let beg = startDateTime.getTime();
    let end = endDateTime.getTime();

    let availableSlots = [];
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let eventStart = new Date(event['start']['DateTime']).getTime();
        let eventEnd = new Date(event['end']['DateTime']).getTime();

        if (beg >= end) {
            break;
        }

        if (beg < eventStart) {
            availableSlots.push({
                start: beg,
                end: eventStart
            });
        }

        beg = eventEnd;
    }

    if (beg < end) {
        availableSlots.push({
            start: beg,
            end: end
        });
    }

    return availableSlots;
}

function _getEventsFromCalanderView(response) {
    let values = response['value'];
    let events = [];
    for (let i = 0; i < values.length; i++) {
        let value = values[i];
        events.push({
            start: value['Start'],
            end: value['End'],
            location: value['Location']
        });
    }

    return events;
}

function _findCommonAvailableSlot(availableSlots, durationInMins) {
    logger.log('function to find common time should be triggered only once');

    let firstAttendeeLastIdx = availableSlots[0].length;
    let slotExhausted = false;

    let indexArr = [];
    for (let i = 0; i < availableSlots.length; i++) {
        indexArr[i] = 0;
    }

    for (
        let firstAttendeeIdx = 0;
        firstAttendeeIdx < firstAttendeeLastIdx && !slotExhausted;
        firstAttendeeIdx++
    ) {
        let firstAttendeeBegTimeInMillis =
            availableSlots[0][firstAttendeeIdx]['start'];
        let firstAttendeeEndTimeInMillis =
            availableSlots[0][firstAttendeeIdx]['end'];
        let meetingEndInMillis =
            firstAttendeeBegTimeInMillis + durationInMins * 60000;
        if (meetingEndInMillis > firstAttendeeEndTimeInMillis) {
            continue;
        }

        let curMaxBegTimeInMillis = firstAttendeeBegTimeInMillis;

        let differentTimeNeeded = false;
        for (
            let i = 1;
            i < availableSlots.length && !slotExhausted && !differentTimeNeeded;
            i++
        ) {
            let slotFound = false;

            for (; indexArr[i] < availableSlots[i].length; indexArr[i]++) {
                let slot = availableSlots[i][indexArr[i]];
                if (
                    slot['start'] <= firstAttendeeBegTimeInMillis &&
                    slot['end'] >= meetingEndInMillis
                ) {
                    slotFound = true;
                    break;
                } else {
                    differentTimeNeeded;
                }
            }

            if (!slotFound && indexArr[i] == availableSlots[i].length) {
                slotExhausted = true;
            }
        }

        if (!differentTimeNeeded && !slotExhausted) {
            return {
                beg: new Date(firstAttendeeBegTimeInMillis).toString(),
                end: new Date(meetingEndInMillis).toString()
            };
        }
    }

    return null;
}

/**
 * Creates a meeting.
 * @param {object} mailBox shows if work account or personal account. Use constants.USER_MAILBOX options
 * @param {string} user the organizer. Use one from the registered users in constants.USER
 * @param {string[]]} attendees the attendees of the meeting. This is optional, use  entries from the registered users in constants.USER
 * @param {Date} startDateTime start time of the meeting.
 * @param {Date} endDateTime end time of the meeting.
 * @param {string} subject subject of the meeting.
 * @param {object} location location of the meeting. This is optional, use one from the predefined location-finder.js
 * @param {string} meetingContent content of the meeting. This is optional.
 */
function scheduleMeeting(
    mailBox,
    user,
    attendees,
    startDateTime,
    endDateTime,
    subject,
    location = '',
    meetingContent = ''
) {
    let token = '';
    let calendarId = '';
    if (mailBox == constants.MAILBOX.WORK) {
        token = tokenCache.work;
        calendarId = USER_ACCOUNTS[user].WORK_CALENDAR_ID;
    } else {
        token = tokenCache.personal;
        calendarId = USER_ACCOUNTS[user].PERSONAL_CALENDAR_ID;
    }

    return meetingSchedulerService
        .scheduleMeeting({
            token: token,
            calendarId: calendarId,
            attendees: attendees,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            subject: subject,
            mailBox: mailBox,
            location: location,
            meetingContent: meetingContent
        })
        .then(res => {
            return res;
        })
        .catch(err => {
            return err;
        });
}

module.exports = {
    getPersonalAvailability: getPersonalAvailability,
    getNextAvailableMeetingTime: getNextAvailableMeetingTime,
    scheduleMeeting: scheduleMeeting
};
