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
    card.content.body.push({
        type: 'TextBlock',
        text: JSON.stringify(timeSlot)
    });

    return new builder.Message(session).addAttachment(card);
}

module.exports = {
    createAvailableTimeMessage: createAvailableTimeMessage
};
