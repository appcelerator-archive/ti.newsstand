
var Newsstand = require('ti.newsstand'),
    Publisher = require('publisher');

// Removes the one background download a day limit
Newsstand.enableDevMode();

// Set the username and password to be used to login to ti.cloud.
// If the user does not exist, it will be created.
var cloudUsername = '<<USERNAME>>';
var cloudPassword = '<<PASSWORD>>';

var Cloud = require('ti.cloud');
Cloud.debug = true;

function eventCallback(e) {

    Ti.API.info('Push message received');
    Ti.API.info('  Message: ' + e.data.alert);
    Ti.API.info('  Payload: ' + e.data.aps);
    Ti.API.info('  Content-Available: ' + e.data['content-available']);
    
    if (e.data['content-available'] === 1) {
        // Must call this function to ensure we have enough time to complete the call
        // if the push is recieved while we are backgrounded.
        Newsstand.beginBackgroundDownloadRequests(); 

        // Getting the list of issues from our server and 
        // downloading the asset for the last one.
        Publisher.getIssueList({
            successCallback: function() {
                var lastIssueIndex = Publisher.numberOfIssues() - 1;
                var issue = Publisher.issueAtIndex(lastIssueIndex);

                var nkIssue = Newsstand.getIssue({
                    name: issue.name
                });
                
                nkIssue.downloadAsset({
                    url: issue.content,
                    filename: issue.name + '.pdf',
                    userInfo: {
                        name: issue.name,
                        index: lastIssueIndex
                    }
                });

                Newsstand.endBackgroundDownloadRequests();
            },
            errorCallback: function() {
                Newsstand.endBackgroundDownloadRequests();
            }
        });
    }
}

function eventSuccess(e) {
    Ti.API.info('Subscribing to Cloud Push with deviceToken: '+e.deviceToken);
    
    Cloud.PushNotifications.subscribe({
        channel: 'test',
        device_token: e.deviceToken,
        type: Ti.Platform.name === 'iPhone OS' ? 'ios' : Ti.Platform.name
    }, function (e) {
        if (e.success) {
            Ti.API.info('Subscribed to push with success');
        }
        else {
           alert(e);
           Ti.API.info('Error subscribing to push: ' + e)
        }
    });
    
    Ti.API.info('Received device token: ' + e.deviceToken);
}

function eventError(e) {
    Ti.API.info('Error:' + e.error);
    var alert = Ti.UI.createAlertDialog({
        title: 'Error',
        message: e.error
    });
    alert.show();   
}

function registerForPush() {
    Ti.Network.registerForPushNotifications({
        types:[
            // Ti.Network.NOTIFICATION_TYPE_BADGE,
            // Ti.Network.NOTIFICATION_TYPE_ALERT,
            // Ti.Network.NOTIFICATION_TYPE_SOUND
            Ti.Network.NOTIFICATION_TYPE_NEWSSTAND
        ],
        success: eventSuccess,
        error: eventError,
        callback: eventCallback
    });
}

function loginToCloud() {
    Cloud.Users.login({
        login: cloudUsername,
        password: cloudPassword
    }, function (e) {
        if (e.success) {
            Ti.API.info('Logged in!');
            registerForPush();
        }
        else {
            Ti.API.info('ERROR login: '+e);
            Cloud.Users.create({
                username: cloudUsername,
                password: cloudPassword,
                password_confirmation: cloudPassword,
                first_name: 'firstName',
                last_name: 'lastName'
            }, function (e) {
                if (e.success) {
                    Ti.API.info('User Created! You are now logged in');
                    registerForPush();
                }
                else {
                    Ti.API.info('ERROR create: '+e);
                }
            });
        }
    });
}

exports.init = loginToCloud;
