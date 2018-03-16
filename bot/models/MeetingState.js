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

class MeetingState {
    constructor() {
        this.person = '';
        this.location = '';
        this.date = '';
        this.subject = '';
    }

    fillState(entities) {
        entities.forEach(entity => {
            const dataFieldName = entityTypeToFieldName[entity];
            if (!dataFieldName) {
                return;
            }

            this[dataFieldName] = this[dataFieldName] || entity.entity;
        });
    }

    isValid() {
        return Object.keys(requiredFields).every(
            fieldName => !!this[fieldName]
        );
    }

    getState() {
        return {
            person: this.person,
            location: this.location,
            date: this.date,
            subject: this.subject
        };
    }
}

module.exports = ConversationState;
