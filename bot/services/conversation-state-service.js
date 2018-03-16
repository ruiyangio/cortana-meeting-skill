const MeetingState = require('../models/MeetingState');

function getOrCreateMeetingState(session, entities) {
    if (!session.userData.meetingSate) {
        session.userData.meetingSate = new MeetingState();
    }

    const meetingState = session.userData.meetingSate;
    meetingState.fillState(entities);
    return meetingState;
}

function removeMeetingState(session) {
    delete session.userData.meetingState;
}

module.exports = {
    getMeetingState: getMeetingState,
    removeMeetingState: removeMeetingState
};
