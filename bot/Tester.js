const constants = require('./constants.js');
const authority = require('./authority.js');
const personaController = require('./services/persona-controller.js');
const availableSlotService = require('./services/available-slot-service.js');

const users = constants.USERS;

function logOutput() {
    var fs = require('fs');
    var util = require('util');
    var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
    // Or 'w' to truncate the file every time the process starts.
    var logStdout = process.stdout;

    console.log = function() {
        logFile.write(util.format.apply(null, arguments) + '\n');
        logStdout.write(util.format.apply(null, arguments) + '\n');
    };
    console.error = console.log;
}

function main4() {
    logOutput();
    let beg = new Date(2018, 2, 21, 7, 0, 0, 0);
    let end = new Date(2018, 2, 21, 17, 0, 0, 0);
    authority.personalToken =
        'EwAgA+l3BAAUWm1xSeJRIJK6txKjBez4GzapzqMAATu+KWSWd0vmAO9QOtlwCKJVT7Kcnfs0fNdxpxGS7Swjcg7Qo8HsrbspJIqAtHonfHFs1Y4JThGG+l+OIjGkgk81MuH/OQzfdq4Nxh++N6HfdAg4xFXIZnsfsknYqQi5cVHIdZ4NA63zmYCLVrPB1mAZ1T/nHqgX18qwkexPZRbKKlHkVslKkd3MWpmC0ybMIgLxwQqbe3PuWPK4i+k93HQXHGVZFtr249CsOB7I7OwyqMa91C2lE0c17LP5pgiM51j9UssVg3OpUh9jnlWBQt10ebpfJ9qekK2gqcUnl9PUtIWoz6iCt3WQuC8SSgkh5a2+enRxHXzgHtv63LbI4W8DZgAACLYsZNB9nYaN8AG/WLBdVw2RX4uLMwKdv5Ul/GwY12JbXUY2us24NVWdOZ+oiPvuIuBwT9U5+ReiPhOyFeSNdoEpdmxeuKJZOF7JDcmUYwnhFzE9vGdVfhqf2A07H/gJNmFddHIWfD1bq1Ho5YmJCci5Xsn5cQnIP8ulGAtT2CAZEcHyVw/+/b0gA44Ck95g9Fm77Btgf3TsvD9LMtvjgJ1/FoFHyDS7h9gY16pB2jFGhtuaWaJHDcKYoc4egz3hAVySF5CmvRuOYtxrto4rTP1kgDjIlc1DMtQC/YJOdTOqwFzFYKvXhiVMZs/cjDHrDYgWSn928XPFT550SqUKklwlTF2EkXRORKJ6br0j1esO1xUfIG4+5zph+kpD5eBDcUGcwrcw4f30uBXD+M9aCEoEf22tvQAxcrXcpivfZ46Mp/5lISVq3pWik/2VqyegQC3vEoqoIdJ5oIrU63YYq3eTKkSWV0Qm3W/NPWnTthxsjcuw4q5r6pisayKzcCGXzgCP1pkKEe0/tg/hWHvIEC4k6Os1eyIrKtxbr7Xq6gYoiM11n6P6O14YUTc7jDdsZiAWUFnAt9Cn7YVQoOTX5g09BFVDPxrmxgqyTPyYlWEy401KJO/bPqezrfiYA3GOdn+pf4Mmy5fzHOjizWC4duVONgSdbfb3e8ZKLwI=';
    authority.workToken =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlNTUWRoSTFjS3ZoUUVEU0p4RTJnR1lzNDBRMCIsImtpZCI6IlNTUWRoSTFjS3ZoUUVEU0p4RTJnR1lzNDBRMCJ9.eyJhdWQiOiJodHRwczovL291dGxvb2sub2ZmaWNlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzQxMTczYWE5LTkwZWYtNDdkNC1iODA3LThkMjlmOWJiMWNmMy8iLCJpYXQiOjE1MjE2NTQxNjMsIm5iZiI6MTUyMTY1NDE2MywiZXhwIjoxNTIxNjU4MDYzLCJhY3IiOiIxIiwiYWlvIjoiWTJOZ1lGaXVrZFI4L2ZBTURya0xteFgyUDNFV3QyTkxTbzgrbmJ0Wjlmb0JYZFBqWmlZQSIsImFtciI6WyJwd2QiXSwiYXBwX2Rpc3BsYXluYW1lIjoiT0F1dGggU2FuZGJveCIsImFwcGlkIjoiMzI2MTNmYzUtZTdhYy00ODk0LWFjOTQtZmJjMzljOWYzZTRhIiwiYXBwaWRhY3IiOiIxIiwiZGV2aWNlaWQiOiI3YjcwNTBmNy03M2M5LTRjODEtOGZiZC0zMDgzM2E4MDkxOGUiLCJlX2V4cCI6MjYyODAwLCJlbmZwb2xpZHMiOltdLCJmYW1pbHlfbmFtZSI6IllhbmciLCJnaXZlbl9uYW1lIjoiUnVpIiwiaXBhZGRyIjoiMTMxLjEwNy4xNzQuMjQ0IiwibmFtZSI6IlJ1aSBZYW5nIiwib2lkIjoiZTdiNWJiZGItNDA4OS00NWMwLWExMWUtODc3MDM5ZjVlZTYyIiwicHVpZCI6IjEwMDNCRkZEQTk2NEVBOTkiLCJzY3AiOiJDYWxlbmRhcnMuUmVhZFdyaXRlIENhbGVuZGFycy5SZWFkV3JpdGUuU2hhcmVkIENvbnRhY3RzLlJlYWRXcml0ZSBDb250YWN0cy5SZWFkV3JpdGUuU2hhcmVkIE1haWwuUmVhZFdyaXRlIE1haWwuUmVhZFdyaXRlLlNoYXJlZCBNYWlsLlNlbmQgTWFpbC5TZW5kLlNoYXJlZCBNYWlsYm94U2V0dGluZ3MuUmVhZFdyaXRlIFBlb3BsZS5SZWFkIFRhc2tzLlJlYWRXcml0ZSBUYXNrcy5SZWFkV3JpdGUuU2hhcmVkIFVzZXIuUmVhZEJhc2ljLkFsbCIsInN1YiI6IlFSc2IxQ2FFVzdwMlJZd2lFWUw2aXRaVFRKRGphZWJndFRRdnRNUmpUM3ciLCJ0aWQiOiI0MTE3M2FhOS05MGVmLTQ3ZDQtYjgwNy04ZDI5ZjliYjFjZjMiLCJ1bmlxdWVfbmFtZSI6InJ5YW5nQG1lbmdkb25neS5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyeWFuZ0BtZW5nZG9uZ3kub25taWNyb3NvZnQuY29tIiwidXRpIjoiX0ZGaERyZjRMazY5eEp1RVJuTU9BQSIsInZlciI6IjEuMCJ9.MgJHpLzMOxjQf58ZSd8Cm-birDXEt09A1raukI-gY1r6OKF2ieHj6-3Avl8EE_kuPxZ_UUIAoY66AQVPVuL6-0XOGgSOVhr0eUh1J4LmUsBhUxqVvO86bwvBIez6F-GfOTFXXFMHDkyZEBvIHN4hG1Yp2zsXxPL_9IAZD5BwakGJ4OHopczWuYtttzoQZ054dXiS9PKoAdhka4DMX0jdZRmsZXB-JC2_cBBjtHlsp2sMSE8a80C1ZJcv0Vee-BqL2RRCKiW1-kJyDnbyDHZ3foiVxWYKrqgIy8BhP-O_gdDRaVmPn5k0GI8Jox9d2fl0cZpOLnLpDEfIlmkUl3hBNg';

    // let persona = new Persona(authority.personalToken, '');
    personaController
        .getPersonalAvailability(
            // constants.USERS.RUI,
            constants.USERS.RUI,
            beg
        )
        .then(res => {
            console.log('this is the result ');
            console.log(res);
        });
}

main4();
