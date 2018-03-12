var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../meeting-skill-app.zip');
var kuduApi = 'https://meeting-skill-app.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$meeting-skill-app';
var password = 'AtuwA3euHkEwBQXpuYJ2xJjeSCdi1fp160lWTYv3MXp7dEvhwbJjeXbB329D';

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('meeting-skill-app publish');
  } else {
    console.error('failed to publish meeting-skill-app', err);
  }
});