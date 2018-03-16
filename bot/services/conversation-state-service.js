const entityTypeToFieldName = {
    person: 'person',
    location: 'location',
    'builtin.datetimeV2.date': 'date',
    'builtin.datetimeV2.duration': 'duration',
    'builtin.datetimeV2.daterange': 'daterange',
    'meeting.subject': 'subject'
};

const requiredFields = {
    person: true,
    location: true,
    date: true,
    subject: true
};

function getMeetingState(session, entities) {
    if (!session.userData.meetingSate) {
        session.userData.meetingSate = {};
    }

    const meetingState = session.userData.meetingSate;
    fillMeetingState(meetingState, entities);
    return meetingState;
}

function fillMeetingState(meetingState, entities) {
    if (!Array.isArray(entities)) {
        return;
    }

    entities.forEach(entity => {
        const dataFieldName = entityTypeToFieldName[entity];
        if (!dataFieldName) {
            return;
        }

        meetingState[dataFieldName] =
            meetingState[dataFieldName] || entity.entity;
    });
}

function isMeetingValid(meetingState) {
    return Object.keys(requiredFields).every(
        fieldName => !!meetingState[fieldName]
    );
}

function removeMeetingState(session) {
    delete session.userData.meetingState;
}

module.exports = {
    getMeetingState: getMeetingState,
    fillMeetingState: fillMeetingState,
    isMeetingValid: isMeetingValid,
    removeMeetingState: removeMeetingState
};
