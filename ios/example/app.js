
/*
 * 1. To fully test this the app, you will need to setup push notifications for the app with ACS http://cloud.appcelerator.com/docs/ios#push
 * 		* Push notifications need to have the 'content-available' key set to 1 in 'aps' object
 * 2. Add newsstandicon.png to the 'Resources/iphone' directory next to appicon.png
 * 2. Before running this example app, add this to your tiapp.xml
 * 
<ios>
    <plist>
        <dict>
            <key>CFBundleIcons</key>
            <dict>
                <key>CFBundlePrimaryIcon</key>
                <dict>
                    <key>CFBundleIconFiles</key>
                    <array>
                        <string>appicon.png</string>
                    </array>
                </dict>
                <key>UINewsstandIcon</key>
                <dict>
                    <key>CFBundleIconFiles</key>
                    <array>
                        <string>newsstandicon.png</string>
                    </array>
                    <key>UINewsstandBindingEdge</key>
                    <string>UINewsstandBindingEdgeLeft</string>
                    <key>UINewsstandBindingType</key>
                    <string>UINewsstandBindingTypeMagazine</string>
                </dict>
            </dict>
            <key>UINewsstandApp</key>
            <true/>
            <key>UIBackgroundModes</key>
            <array>
                <string>newsstand-content</string>
            </array>
        </dict>
    </plist>
</ios>
 *
 */

////////////////////////////////////////////////////////
// Urban Airship
// Uncomment the code below to use Urban Airship
////////////////////////////////////////////////////////

/**
var UrbanAirship = require('ti.urbanairship');

UrbanAirship.tags = [ 'testingtesting', 'appcelerator', 'my-tags' ];
UrbanAirship.alias = 'testDevice';
UrbanAirship.autoBadge = true;
UrbanAirship.autoResetBadge = true;

function eventCallback(e) {
	// Pass the notification to the module
    UrbanAirship.handleNotification(e.data);
   
  	Ti.API.info('Push message received');
  	Ti.API.info('  Message: ' + e.data.alert);
  	Ti.API.info('  Payload: ' + e.data.aps);
  	Ti.API.info('  Content-Available: ' + e.data['content-available']);
  	
  	if (e.data['content-available'] === 1) {
  			var name = issues[0].name;
			var content = issues[0].content;
			
			Ti.API.info('Downloading asset for issue: '+name+' from URL: '+content);
			
			var issue = Newsstand.getIssue({
				name: name
			});
			
			if (!issue) {
				// if issue is not found then add it
				issue = Newsstand.addIssue({
					name: name,
					date: new Date()
				});
			}
			
			issue.downloadAsset({
				url: content,
				userInfo: {
					id: 9999,
					name: 'TESTBACKGROUND'
				}
			});
  	}
}

function eventSuccess(e) {
	// *MUST* pass the received token to the module
    UrbanAirship.registerDevice(e.deviceToken);  
    
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
*/

////////////////////////////////////////////////////////
// Cloud Push
// Uncomment the code below to use Cloud Push
////////////////////////////////////////////////////////

/**
var Cloud = require('ti.cloud');
Cloud.debug = true;

function eventCallback(e) {

  	Ti.API.info('Push message received');
  	Ti.API.info('  Message: ' + e.data.alert);
  	Ti.API.info('  Payload: ' + e.data.aps);
  	Ti.API.info('  Content-Available: ' + e.data['content-available']);
  	
  	if (e.data['content-available'] === 1) {
  			var name = issues[0].name;
			var content = issues[0].content;
			
			Ti.API.info('Downloading asset for issue: '+name+' from URL: '+content);
			
			var issue = Newsstand.getIssue({
				name: name
			});
			
			if (!issue) {
				// if issue is not found then add it
				issue = Newsstand.addIssue({
					name: name,
					date: new Date()
				});
			}
			
			issue.downloadAsset({
				url: content,
				userInfo: {
					id: 9999,
					name: 'TESTBACKGROUND'
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
            alert('Subscribed!');
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

var cloudUsername = 'jalter';
var cloudPassword = 'password';

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

loginToCloud();
*/

////////////////////////////////////////////////////////
// Data and Functions
////////////////////////////////////////////////////////

var issues = [
	{
		name: 'Magazine-0',
		title: 'Magazine Issue 0',
		date: '2012-01-15',
		cover: 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/images/magazine-0.png',
		content: 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/images/magazine-0.pdf'
	},
	{
		name: 'Magazine-1',
		title: 'Magazine Issue 1',
		date: '2012-02-15',
		cover: 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/images/magazine-1.png',
		content: 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/images/magazine-1.pdf'
	},
	{
		name: 'Magazine-2',
		title: 'Magazine Issue 2',
		date: '2012-03-15',
		cover: 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/images/magazine-2.png',
		content: 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/images/magazine-2.pdf'
	}
];

var library = [];
var currentIssueIndex = 0;
var currentImageIndex = 0;
var rows = [
	{
		title: 'Add Issue',
		onClick: function(){
			var currentIssue = issues[(currentIssueIndex++)%(issues.length)];
			var dateArray = currentIssue.date.split('-');
			var issueDate = new Date();
			issueDate.setFullYear(dateArray[0]);
			issueDate.setMonth(dateArray[1]);
			issueDate.setDate(dateArray[2]);
			
			var issue = Newsstand.addIssue({
				name: currentIssue.name,
				date: issueDate
			});
			
			Ti.API.info('ISSUE: '+issue);
			
			if (issue) {
				library.push(issue);
			
				Ti.API.info('Added issue to library with:');
				Ti.API.info('issue.name: '+issue.name);
				Ti.API.info('issue.date: '+issue.date);
				Ti.API.info('issue.status: '+issue.status);
				Ti.API.info('issue.contentURL: '+issue.contentURL);
				
				logInApp('Added issue to library: ' + issue.name);
			} else {
				Ti.API.info('Issue was not added to library');
				logInApp('Issue was not added to library');
			}
		}
	},
	{
		title: 'Get Issue',
		onClick: function(){
			var issue = Newsstand.getIssue({
				name: 'Magazine-0' 
			});
			
			if (issue) {
				Ti.API.info('Retrieved issue from library:');
				Ti.API.info('issue.name: '+issue.name);
				Ti.API.info('issue.date: '+issue.date);
				Ti.API.info('issue.status: '+issue.status);
				Ti.API.info('issue.contentURL: '+issue.contentURL);
				
				logInApp('Retrieved issue from library: ' + issue.name);
				
				Ti.API.info('TEST '+ (issue.status == Newsstand.ISSUE_CONTENT_STATUS_NONE) );
			} else {
				Ti.API.info('Issue was not retrieved from library');
				logInApp('Issue was not retrieved from library');
			}
		}
	},
	{
		title: 'Get Issues',
		onClick: function(){
			library = Newsstand.issues
			
			Ti.API.info('Issues: ' + library.length);
			var names = '';
			for (var i = 0, j = library.length; i < j; i++) {
				Ti.API.info('Found issue named ' + library[i].name + ' in library.');
				Ti.API.info('Date: ' + library[i].date);
				names = names + '\n -->' + library[i].name; 
			}
			Ti.API.info('Found ' + library.length + ' issues in library ' + names);
			logInApp('Found ' + library.length + ' issues in library ' + names);
		}
	},
	{
		title: 'Remove All Issues',
		onClick: function(){
			for (var i = 0, j = library.length; i < j; i++) {
				var issue = library.pop();
				Newsstand.removeIssue(issue);
				Ti.API.info('removed issue ' + issue.name + 'from library');
			}
			logInApp('Removed all issues from library');
		}
	},
	{
		title: 'Set Currently Reading',
		onClick: function(){
			if (Newsstand.currentlyReadingIssue) {
				Ti.API.info('currentlyReadingIssue before set: '+Newsstand.currentlyReadingIssue.name);
			} else {
				Ti.API.info('currentlyReadingIssue is not set');
			}
			
			if (library.length) {
				Newsstand.currentlyReadingIssue = library[0];
				Ti.API.info('currentlyReadingIssue after set: '+Newsstand.currentlyReadingIssue.name);
				logInApp('currentlyReadingIssue: ' + Newsstand.currentlyReadingIssue.name);
			} else {
				Ti.API.info('No issues in library');
				logInApp('No issues in library');
			}
			
		}
	},
	{
		title: 'Download Asset',
		onClick: function(){
			if (library.length) {
				var issue = library[0];
				var content = issues[0].content; // for this example we are downloading the same asset for every issue
				
				Ti.API.info('Downloading Asset for issue named: ' + issue.name + ' from URL: ' + content);
				logInApp('Downloading asset for issue named: ' + issue.name);
				
				issue.downloadAsset({
					url: content,
					// filename: 'TEST.TST', // set the filename of the file to be downloaded
					userInfo: {
						id: 1234,
						name: 'TEST1'
					}
				});
			} else {
				Ti.API.info('No issues in library');
				logInApp('No issues in library');
			}
		}
	},
	{
		title: 'Show/Hide Badge',
		onClick: function(){
			Ti.API.info('Badge Number Before: ' + Newsstand.applicationIconBadgeNumber);
			Newsstand.applicationIconBadgeNumber = (Newsstand.applicationIconBadgeNumber > 0) ? 0 : 2;
			Ti.API.info('Badge Number After: ' + Newsstand.applicationIconBadgeNumber);
			logInApp('App badge number set to ' + Newsstand.applicationIconBadgeNumber + ', close the app and check it out');
		}
	},
	{
		title: 'Change App Icon',
		onClick: function(){
			 var url = issues[(currentImageIndex++)%(issues.length)].cover;
			 Ti.API.info('New App Icon URL: '+url);
			 var client = Ti.Network.createHTTPClient({
			     onload : function(e) {
			         var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'newIcon.png');
			         Newsstand.iconImage = file;
			         logInApp('App icon set, close the app and check it out');
			     },
			     onerror : function(e) {
			         Ti.API.debug(e.error);
			         alert('error: see console log');
			     },
			     timeout : 5000  // in milliseconds
			 });
			 
			 client.open('GET', url);
			 client.file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'newIcon.png');
			 
			 client.send(); 
			 logInApp('Downloading new app icon...');
		}
	}
];

var Newsstand = require('ti.newsstand');
// Removes the one the 1 background download a day limit
Newsstand.enableDevMode(); 
// Sets credentials to be used if 'downloadAsset' needs to authenticate
Newsstand.setBasicAuthentication({
	username: 'jalter',
	password: 'password'
});

Newsstand.addEventListener('progress', function(e){
	Ti.API.info('PROGRESS object: ' + JSON.stringify(e));
	logInApp('Download progress: ' + e.bytesWritten + ' of '  + e.totalBytes);
});
Newsstand.addEventListener('error', function(e){
	Ti.API.info('ERROR object: ' + JSON.stringify(e));
	logInApp('Download error: ' + e.description);
});
Newsstand.addEventListener('assetcomplete', function(e){
	var file = Ti.Filesystem.getFile(e.filePath);
	
	Ti.API.info('ASSETCOMPLETE object: ' + JSON.stringify(e));
	Ti.API.info('Asset Download complete and file exists: ' + file.exists());
	logInApp('Asset Download complete and file exists: ' + file.exists());
});
Newsstand.addEventListener('issuecomplete', function(e){
	Ti.API.info('ISSUECOMPLETE for issue named ' + e.name);
	logInApp('Issue Download complete for issue named: ' + e.name);
});

// Issue status constants
Ti.API.info('ISSUE_CONTENT_STATUS_NONE: ' + Newsstand.ISSUE_CONTENT_STATUS_NONE);
Ti.API.info('ISSUE_CONTENT_STATUS_DOWNLOADING: ' + Newsstand.ISSUE_CONTENT_STATUS_DOWNLOADING);
Ti.API.info('ISSUE_CONTENT_STATUS_AVAILABLE: ' + Newsstand.ISSUE_CONTENT_STATUS_AVAILABLE);

library = Newsstand.issues;

function logInApp(text) {
	textLog.value = text + '\n' + textLog.value;
}

////////////////////////////////////////////////////////
// UI
////////////////////////////////////////////////////////
var win = Ti.UI.createWindow({
	backgroundColor: 'white'
});
win.open();

var textLog = Ti.UI.createTextArea({
	top: 0,
	height: '20%',
	width: '100%',
	borderWidth: '2',
	borderColor: '#000',
	value: 'Note: add an issue to the library first' + '\nAppLog: see device log for more info'
});
win.add(textLog);

var tableView = Ti.UI.createTableView({
	top: '20%',
	data: rows
});
tableView.addEventListener('click', function(e){
	e.source.onClick && e.source.onClick();
});
win.add(tableView);
