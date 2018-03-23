const builder = require('botbuilder');
const cardTemplate = {
    contentType: 'application/vnd.microsoft.card.adaptive',
    content: {
        type: 'AdaptiveCard',
        body: [
            {
                type: 'TextBlock',
                text: 'Meeting Skill',
                size: 'large',
                weight: 'bolder'
            }
        ]
    }
};

function _copyTemplate() {
    return JSON.parse(JSON.stringify(cardTemplate));
}

function createAvailableTimeMessage(session, timeSlot) {
    const card = _copyTemplate();
    card.content.body[0].text = 'Your next available time:';
    card.content.body[0].speak = `You have free time ${timeSlot}`;
    card.content.body.push({
        type: 'TextBlock',
        text: timeSlot
    });

    return new builder.Message(session).addAttachment(card);
}

function createCalendarCardMessage(session, meetingState) {
    const card = _copyTemplate();
    card.content.body[0].text = 'Your meeting details:';
    card.content.body[0].speak = `I found a free time for you to meet with ${
        meetingState.person
    }. Do you want to schedule this meeting?`;
    card.content.body.push({
        type: 'TextBlock',
        text: meetingState.subject
    });
    card.content.body.push({
        type: 'TextBlock',
        text: meetingState.location,
        isSubtle: true
    });
    card.content.body.push({
        type: 'TextBlock',
        text: meetingState.mockStartDates[0].display,
        isSubtle: true
    });

    return new builder.Message(session).addAttachment(card);
}

module.exports = {
    createAvailableTimeMessage: createAvailableTimeMessage,
    createCalendarCardMessage: createCalendarCardMessage
};
