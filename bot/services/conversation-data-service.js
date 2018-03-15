let conversationState = null;

function setconversationState(data) {
    conversationState = data;
}

function getconversationState() {
    if (!conversationState) return;
    return JSON.parse(JSON.stringify(conversationState));
}

function removeConversationState() {
    conversationState = null;
}

function getValidEntityTypes(entityType) {
    const typeToDataField = {
        'person': 'person',
        'location': 'location',
        'builtin.datetimeV2.date': 'date',
        'builtin.datetimeV2.duration': 'duration',
        'builtin.datetimeV2.daterange': 'daterange',
        'meeting.subject': 'subject'
    };

    return typeToDataField[entityType];
}

function backFillconversationState(entities) {
    let conversationState = getconversationState() || {};
    entities.forEach(entity => {
        const dataFieldName = getValidEntityTypes(entity.type);
        if (!dataFieldName) {
            return;
        }

        conversationState[dataFieldName] = conversationState[dataFieldName] || entity.entity;
    });

    setconversationState(conversationState);
}

module.exports = {
    setconversationState: setconversationState,
    getconversationState: getconversationState,
    removeConversationState: removeConversationState,
    getValidEntityTypes: getValidEntityTypes,
    backFillconversationState: backFillconversationState
}
