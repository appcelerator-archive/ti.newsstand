var Newsstand = require('ti.newsstand'),
    Network   = require('network');

var _issues = [],
    _ready = false;

exports.getIssueList = function(params) {
    // Getting the list of issues from our server
    Network.sendRequest({
        url: 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/issues.json',
        onload: function(e) {
            if (e && e.responseText) {
                var json = JSON.parse(e.responseText);
                // Holding on to the issues, we will use them later
                _issues = json.issues;
                _ready = true;
                exports.addIssuesToNewsstand(params);
            }
        },
        onerror: function(e) {
            if (params && params.errorCallback) {
                params.errorCallback(e);
            }
        }
    });
}

exports.addIssuesToNewsstand = function(params) {
    // Adding adding issues to the Newsstand library
    var issue, dateArray, issueDate;
    for (var i = 0, j = _issues.length; i < j; i++) {
        issue = _issues[i];
        
        // Checking if issue already exists in library before adding it
        if (!Newsstand.getIssue({name: issue.name})) {
            dateArray = issue.date.split('-');
            issueDate = new Date();
            issueDate.setFullYear(dateArray[0]);
            issueDate.setMonth(dateArray[1]);
            issueDate.setDate(dateArray[2]);

            var nkIssue = Newsstand.addIssue({
                name: issue.name,
                date: issueDate
            });

            if (!nkIssue) {
                Ti.API.info('Error adding issue ' + issue.name + ' to library');
            }
        }
    }

    if (params && params.successCallback) {
        params.successCallback();
    }
}

exports.issueAtIndex = function(idx) {
    return _issues[idx];
}

exports.numberOfIssues = function() {
    return _issues.length;
}

exports.isReady = function() {
    return _ready;
}

exports.removeAllIssues = function() {
    removeIssuesFromNewsstand();
    _issues = [];
}

exports.removeAllIssuesFromNewsstand = function() {
    removeIssuesFromNewsstand();
}

function removeIssuesFromNewsstand() {
    var nkIssues = Newsstand.issues;
    for (var i = 0, j = nkIssues.length; i < j; i++) {
        Newsstand.removeIssue(nkIssues[i]);
    }
}
