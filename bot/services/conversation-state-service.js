const entityTypeToFieldName = {
    person: 'person',
    'Calendar.Location': 'location',
    'builtin.datetimeV2.date': 'date',
    'builtin.datetimeV2.duration': 'duration',
    'builtin.datetimeV2.daterange': 'date',
    'Calendar.Subject': 'subject',
    'meeting.type': 'type'
};

const requiredFields = {
    person: true,
    location: true,
    date: true,
    subject: true,
    type: true
};

function getMeetingState(session, entities) {
    if (!session.privateConversationData.meetingState) {
        session.privateConversationData.meetingState = {};
    }

    const meetingState = session.privateConversationData.meetingState;
    fillMeetingState(meetingState, entities);
    session.privateConversationData.meetingState = meetingState;
    return meetingState;
}

function fillMeetingState(meetingState, entities) {
    if (!Array.isArray(entities)) {
        return;
    }

    entities.forEach(entity => {
        const dataFieldName = entityTypeToFieldName[entity.type];
        if (!dataFieldName) {
            return;
        }

        meetingState[dataFieldName] =
            meetingState[dataFieldName] || entity.entity;
    });
}

function getFreeTimeScope(entities) {
    const freeTimeScope = {};
    entities.forEach(entity => {
        const dataFieldName = entityTypeToFieldName[entity.type];
        if (!dataFieldName) {
            return;
        }

        freeTimeScope[dataFieldName] =
            freeTimeScope[dataFieldName] || entity.entity;
    });

    if (!freeTimeScope.date) {
        freeTimeScope.date = 'today';
    }

    return freeTimeScope;
}

function isMeetingValid(meetingState) {
    return Object.keys(requiredFields).every(
        fieldName => !!meetingState[fieldName]
    );
}

function removeMeetingState(session) {
    session.privateConversationData.meetingState = {};
}

function askMissingData(session) {
    const meetingState = session.privateConversationData.meetingState;

    if (!meetingState.subject) {
        session.say(
            'What is the subject of this meeting?',
            'What is the subject of this meeting?'
        );
    } else if (!meetingState.duration) {
        session.say('How long is the meeting?', 'How long is the meeting?');
    } else if (!meetingState.location) {
        session.say(
            'Where do you want to have this meeting?',
            'Where do you want to have this meeting?'
        );
    } else if (!meetingState.date) {
        session.say(
            'When do you want this meeting?',
            'When do you want this meeting?'
        );
    } else if (!meetingState.person) {
        session.say('Who do you want to meet?', 'Who do you want to meet?');
    } else if (!meetingState.type) {
        session.say(
            'Is this a work meeting or personal meeting?',
            'Work or personal?'
        );
    } else {
        session.say(
            `Your meeting: ${JSON.stringify(meetingState)}`,
            'Schedule this meeting?'
        );
    }
}

function handleMissingDataQuery(session, args, next) {
    const meetingState = getMeetingState(session, args.entities);

    askMissingData(session);
}

module.exports = {
    getMeetingState: getMeetingState,
    fillMeetingState: fillMeetingState,
    isMeetingValid: isMeetingValid,
    removeMeetingState: removeMeetingState,
    askMissingData: askMissingData,
    handleMissingDataQuery: handleMissingDataQuery,
    getFreeTimeScope: getFreeTimeScope
};
