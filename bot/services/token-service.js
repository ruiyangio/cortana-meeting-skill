const builder = require('botbuilder');
const constants = require('../constants');
const jwt = require('jsonwebtoken');
const restClient = require('../util/rest-client');

let tokenCache = {
    work: '',
    personal: ''
};

function _createSigninCard(session) {
    return new builder.SigninCard(session)
        .text('Sign in')
        .button('Sign-in', 'https://login.microsoftonline.com');
}

/**
 * @returns {Promise<Boolean>}
 */
function validateToken() {
    return restClient
        .getCall(`${constants.O365_API_V2_BASE}/me`, tokenCache.work)
        .then(response => {
            return restClient.getCall(
                `${constants.GRAPH_API_V1_BASE}/me/calendars`,
                tokenCache.personal
            );
        });
}

function getTokens() {
    return tokenCache;
}

function getTokenType(token) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.upn) {
        return 'personal';
    } else if (decoded.upn.includes(constants.TEST_TENENT)) {
        return 'work';
    }

    return 'personal';
}

function promptSignin(session, args, next) {
    session.message.entities.forEach(entity => {
        if (entity.type === constants.AUTH_ENTITY_TYPE) {
            tokenCache[getTokenType(entity.token)] = entity.token;
        }
    });

    validateToken()
        .then(tokenValid => {
            next();
        })
        .catch(error => {
            const signInMessage = new builder.Message(session).addAttachment(
                _createSigninCard(session)
            );
            session.send(signInMessage);
        });
}

module.exports = {
    validateToken: validateToken,
    promptSignin: promptSignin,
    getTokens: getTokens
};
