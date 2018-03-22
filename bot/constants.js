const USERS = {
    RUI: 'rui',
    MIKE: 'mike'
};

const USER_ACCOUNTS = {
    rui: {
        WORK_EMAIL_ID: 'ryang@mengdongy.onmicrosoft.com',
        PERSONAL_EMAIL_ID: 'rui.yang.personal1@hotmail.com',
        PERSONAL_CALENDAR_ID:
            'AQMkADAwATYwMAItZmNjADUtNWE0Yy0wMAItMDAKAEYAAAOPSrSIBrRiQ4wGQzknDj_sBwDb7DRf-vVOQJRCyKxoKFiOAAACAQYAAADb7DRf-vVOQJRCyKxoKFiOAAACEQsAAAA=',
        WORK_CALENDAR_ID:
            'AQMkAGY0OThjOTZjLTgyYzQtNGQzZS1hYjdiLWM4NzkxMjFiZjkyOQBGAAAD5veLlESK1UqDdvV7LYU2OAcAngPaRAkU5U2_KB_oepOZ3AAAAgEGAAAAngPaRAkU5U2_KB_oepOZ3AAAAhHiAAAA',
        NAME: 'Rui Yang'
    },
    mike: {
        WORK_EMAIL_ID: 'mike@mengdongy.onmicrosoft.com',
        PERSONAL_EMAIL_ID: 'mike.personal1@hotmail.com',
        PERSONAL_CALENDAR_ID:
            'AQMkADAwATZiZmYAZC1mYzQ4LTEwMABjLTAwAi0wMAoARgAAAx7WIDNBpyFIj48A94Ib2NVgBwD1SfVUBlsQRIX6gVJMJCIyAAACAQYAAAD1SfVUBlsQRIX6gVJMJCIyAAACEQsAAAA=',
        WORK_CALENDAR_ID:
            'AAMkAGUzYjIzNzQ0LTFkYjItNGQwYS04YTAwLWY3ODBmNmEzNjM4ZABGAAAAAABZIRb5Fjz8Q5pUBT9JEdXUBwDM9OHSIPZORZdmp5YbNEmcAAAAAAEGAADM9OHSIPZORZdmp5YbNEmcAAAAABemAAA=',
        NAME: 'Mike Smith'
    }
};

const URLS = {
    FIND_MEETING_TIME:
        'https://outlook.office.com/api/v2.0/me/findmeetingtimes',
    BASE_GET_CALENDAR_VIEW: 'https://graph.microsoft.com/v1.0/me/calendars/',
    BASE_SCHEDULE_MEETING_URL: 'https://graph.microsoft.com/v1.0/me/calendars/'
};

const MAILBOX = {
    PERSONAL: 'personal',
    WORK: 'work'
};

module.exports = {
    BEARER: 'Bearer',
    JSON_HEADER: 'application/json',
    AUTH_HEADER_NAME: 'Authorization',
    O365_API_V2_BASE: 'https://outlook.office.com/api/v2.0',
    GRAPH_API_V1_BASE: 'https://graph.microsoft.com/v1.0',
    AUTH_ENTITY_TYPE: 'AuthorizationToken',
    TEST_TENENT: 'mengdongy.onmicrosoft.com',
    USERS: USERS,
    USER_ACCOUNTS: USER_ACCOUNTS,
    URLS: URLS,
    MAILBOX: MAILBOX
};
