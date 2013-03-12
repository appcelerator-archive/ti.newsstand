# Ti.Newsstand.Issue

## Description

A _Ti.Newsstand_ module object which represents an issue from the Newsstand library.

## Functions

### void downloadAsset(args[object])

Downloads an asset for this issue. This connection is managed by the system. This allows it to run in the background even when the app is not running. Download progress and errors can be captured using event listeners.

Takes an object of arguments:

* args [object]
	* **url** [string] (required): location of the asset to be downloaded
	* **userInfo** [object] (optional): a dictionary of properties that can be passed through with the request to the event listeners. **Note:** Do not include anything more than simple key value pairs. Including Titanium objects in userInfo will cause errors. Noteworthy keys in userInfo
	* **filename** [string]: the name of the file to be downloaded. If no name is specified here, the filename will be the last component of the url.
	
Throws and exception if called twice to download the same asset for a single issue.

## Properties

### Ti.Newsstand.Issue.name [string] (read-only)

The name of the issue.

### Ti.Newsstand.Issue.date [string] (read-only)

The date of the issue.

### Ti.Newsstand.Issue.status [string] (read-only)

The status of the issue. Status options:

* Newsstand.ISSUE_CONTENT_STATUS_NONE
* Newsstand.ISSUE_CONTENT_STATUS_DOWNLOADING
* Newsstand.ISSUE_CONTENT_STATUS_AVAILABLE

### Ti.Newsstand.Issue.contentURL [string] (read-only)

The contentURL of the issue. This is the location assets downloaded for the issue will be saved.
**Note:** contentURL will be undefined after an issue is removed from the library.
