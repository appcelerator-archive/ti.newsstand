# Newsstand Module

## Description

The Newsstand module allows you to access Apple's NewsKit APIs

## Dependencies

This module requires iOS 5 or greater

## Documentation

### General
For information on getting started with Newsstand, checkout Apple's [Newsstand for Developers](https://developer.apple.com/newsstand/) page.

### Framework
For more information about Newsstand framework, checkout the [Newsstand Kit Framework Reference](https://developer.apple.com/library/ios/#documentation/StoreKit/Reference/NewsstandKit_Framework/_index.html).

### Publishing
Apple allows you to update your app icon in iTunes connect so that the latest issue can always be displayed. Documentation around setting this up can be found in the [iTunes Connect Developer Guide](https://developer.apple.com/library/ios/#documentation/LanguagesUtilities/Conceptual/iTunesConnect_Guide/14_Newsstand/Newsstand.html).

## Getting Started

View the [Using Titanium Modules](http://docs.appcelerator.com/titanium/latest/#!/guide/Using_Titanium_Modules) document for instructions on getting
started with using this module in your application.

## Setup

1. Setup the app as a Newsstand app by adding the code below to your tiapp.xml
2. Modify the `UINewsstandBindingEdge` and `UINewsstandBindingType` values to get different decorations on the icons. Available options can be found in Apple's [CoreFoundationKeys Documentation](https://developer.apple.com/library/mac/#documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html).
3. Add `newsstandicon.png` to the 'Resources/iphone' directory next to appicon.png
4. Run the app, you should see it in the Newsstand folder.
5. During development, be sure to call `enableDevMode()` to remove the daily download limit.

tiapp.xml

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
                            <string>icon_newsstand.png</string>
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

## Push Notifications

Push notifications can be sent to the device to notify it that a new issue is available. The notification payload must contain a "content-available" key set to 1. If this is not set, iOS will not allow the application to wake in the background to download a new issue.

	{
	  "aps":{
		"content-available":1,
	        },
	   "device_tokens": ["exampleToken4F2509D125889AED3466F4D1376B26C374190B3974739"]
	}
	
Use the `Ti.Network.NOTIFICATION_TYPE_NEWSSTAND` type when calling **registerForPushNotifications**

	Ti.Network.registerForPushNotifications({
	    types:[
	        Ti.Network.NOTIFICATION_TYPE_NEWSSTAND
	    ],
	    success: eventSuccess,
	    error: eventError,
	    callback: eventCallback
	});

To enable your application to download assets in the background in response to a push notification, you *must* wrap 
your [downloadAsset](issue.html) calls with calls to `beginBackgroundDownloadRequests` and `endBackgroundDownloadRequests`.

For example, the event callback specified for `registerForPushNotifications` might look like the following:

	function eventCallback(e) {
	  	if (e.data['content-available'] === 1) {
			Newsstand.beginBackgroundDownloadRequests();
			var issue = Newsstand.getIssue({
				name: issues[0].name
			});	
			if (!issue) {
				// if issue is not found then add it
				issue = Newsstand.addIssue({
					name: name,
					date: new Date()
				});
			}
			issue.downloadAsset({
				url: issues[0].content,
				userInfo: {
					id: 9999,
					name: 'TESTBACKGROUND'
				}
			});
			Newsstand.endBackgroundDownloadRequests();
	  	}
	}


## Accessing the Newsstand Module

To access this module from JavaScript, you would do the following:

	var Newsstand = require("ti.newsstand");

The newsstand variable is a reference to the Module object.


## Functions

### void enableDevMode()

Newsstand push notifications are only allowed one background download per day. This function will disable this limit during testing.

__NOTE__: _A development device refers to a device which has been recognized in Xcode Organizer as having the "Use for Development" checkbox enabled._

#### Example

	Newsstand.enableDevMode();
	
### void beginBackgroundDownloadRequests()

Signals the start of a series of [downloadAsset](issue.html) calls. This call notifies the device that additional time may
be needed by the application while running in the background.

#### Example

    Newsstand.beginBackgroundDownloadRequests();
    issue1.downloadAsset(...);
    issue2.downloadAsset(...);
    Newsstand.endBackgroundDownloadRequests();

### void endBackgroundDownloadRequests()

Signals the end of a series of [downloadAsset](issue.html) calls. This call notifies the device that the application no longer
requires additional time while running in the background.

#### Example

    Newsstand.beginBackgroundDownloadRequests();
    issue1.downloadAsset(...);
    issue2.downloadAsset(...);
    Newsstand.endBackgroundDownloadRequests();

### [Ti.Newsstand.Issue][] addIssue(args[object]) 

Adds an issues to the library.

* args [object]
	* name [string] (required): unique name of the issue to be added to the library
	* date [Date] (required): release date of the issue

* returns: a [Ti.Newsstand.Issue][] representing the issue that was added to the library or undefined if the issues does not exist in the library.

Throws an exception if name and date are invalid. Also throws an exception if you use a name that is already taken by another issue.

#### Example

	var issueDate = new Date();
	// Jan 15, 2013
	issueDate.setFullYear(2013);
	issueDate.setMonth(0);
	issueDate.setDate(14);
	var issue = Newsstand.addIssue({
		name: "Magazine-0", 
		date: issueDate
	});

### [Ti.Newsstand.Issue][] getIssue(args[object])

Retrieves an issue from the library, via its unique name.

* args [object]
	* name [string] (required): unique name of the issue to be retrieved from the library
	
* returns: a [Ti.Newsstand.Issue][] representing the issue or undefined if the issues does not exist in the library

#### Example
	
	var issue = Newsstand.getIssue({
		name: "Magazine-0"
	});

### void removeIssue(issue[[Ti.Newsstand.Issue][]])

Removes an issue from the library.

* issue [[Ti.Newsstand.Issue][]] (required): the issue to be removed

**Note:** Properties of [Ti.Newsstand.Issue][] will still be accessible after an issue is removed from the library. This does not apply to `contentURL` which will be undefined. 

#### Example

	Newsstand.removeIssue(issueToRemove);

### void setBasicAuthentication(args[object])

Sets the username and password that will be used if the `downloadAsset` call needs to authenticate.

* args [object]
	* username [string] (required) 
	* password [string] (required)

#### Example

	Newsstand.setBasicAuthentication({
		username: "jalter",
		password: "password"
	});

## Properties

### issues [array] (readonly)

Returns an array of [Ti.Newsstand.Issue][]s representing the current issues in the library.

### currentlyReadingIssue \[[Ti.Newsstand.Issue][]\]

Accesses or sets the newsstand issue that the user is currently reading. If no issue is set, it will be undefined.

Newsstand Kit takes this setting into consideration when it purges back issues because of low levels of available flash storage.

### applicationIconBadgeNumber [number]

Accesses or sets the icon badge number of the app. Instead of displaying a badge number on the app icon, this will set the "new" badge on the app icon if the number is greater than 0.

### iconImage [[Ti.Filesystem.File](http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.Filesystem.File)] (writeonly)

Sets the image of the application icon.

**Note:** If the image is not within the dimensions outlined in the Newsstand Icon section of the [iOS Human Interface Guidelines](http://developer.apple.com/library/ios/#documentation/userexperience/conceptual/mobilehig/IconsImages/IconsImages.html), it may not be displayed.

**Note:** Sometimes this does not work on the simulator. Works consistently on device.

#### Example

	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'newIcon.png');
	Newsstand.iconImage = file;

## Constants

### ISSUE\_CONTENT\_STATUS\_NONE [int]

Assets are not downloading for the issue and there is no content at contentURL.

### ISSUE\_CONTENT\_STATUS\_DOWNLOADING [int]

The issue has assets that are currently downloading.

### ISSUE\_CONTENT\_STATUS\_AVAILABLE [int]

Downloading of assets is not taking place and there is issue content at contentURL.

## Events

### progress

Occurs if you call downloadAsset and an issue asset is downloading. This event is only sent when the application
is running in the foreground. The following event information will be provided:

* name [string]: the unique name of the issue the asset is being downloaded for
* userInfo [object]: the dictionary of key value pairs that was set when calling `downloadAsset`
* bytesWritten [number]: the number of bytes downloaded
* totalBytes [number]: the total number of bytes to download for the current asset

**Note:** totalBytes only applies to the current file being downloaded.

### error

Occurs when there is an error while downloading an asset. The following event information will be provided:

* name [string]: the unique name of the issue the asset is being downloaded for
* userInfo [object]: the dictionary of key value pairs that was set when calling `downloadAsset`
* description [string]: description of the error
* code [string]: error code

### assetcomplete

Occurs when each asset download completes. The following event information will be provided:

* name [string]: the unique name of the issue the asset is being downloaded for
* userInfo [object]: the dictionary of key value pairs that was set when calling `downloadAsset`
* filePath [string]: the location of the file that was downloaded

### issuecomplete

Occurs when all of the asset downloads that have been started for an issue are complete. This could be a successful completion or error. The following event information will be provided:

* name [string]: the unique name of the issue

## Usage

See example.

## Author

Jon Alter

## Module History

View the [change log](changelog.html) for this module.

## Feedback and Support

Please direct all questions, feedback, and concerns to [info@appcelerator.com](mailto:info@appcelerator.com?subject=iOS%20Newsstand%20Module).

## License

Copyright(c) 2013 by Appcelerator, Inc. All Rights Reserved. Please see the LICENSE file included in the distribution for further details.

[Ti.Newsstand.Issue]: issue.html