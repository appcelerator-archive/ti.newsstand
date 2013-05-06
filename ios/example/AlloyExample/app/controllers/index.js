/*
 * Newsstand Example Application
 *
 * 1. To test push
 *     * Setup push notifications for the app with ACS http://cloud.appcelerator.com/docs/ios#push
 *         * Push notifications need to have the 'content-available' key set to 1 in 'aps' object
 *         * eg. {"badge": 4, "alert": "Hey","content-available":1} 
 *     * Enter a cloudUsername and cloudPassword in push.js
 *    else
 *     * Remove the lines related to push in alloy.js
 * 2. Add this to your tiapp.xml
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

var Newsstand = require('ti.newsstand'),
    Publisher = require('publisher'),
    Network   = require('network');

var rowControllers = [];

// -- UI Events --
function onDelete() {
    Publisher.removeAllIssuesFromNewsstand();
    Publisher.addIssuesToNewsstand({
        successCallback: refreshRows
    });
    Newsstand.applicationIconBadgeNumber = 0;
}

function onRefresh() {
    loadIssues();
}

function onTableClick(e) {  
    // Start download or read issue
    var nkIssue = Newsstand.getIssue({
        name: e.rowData.issueName
    });

    if (nkIssue.status == Newsstand.ISSUE_CONTENT_STATUS_NONE) {
        // Download
        downloadIssueAtIndex(nkIssue, e.index);
    } else if (nkIssue.status == Newsstand.ISSUE_CONTENT_STATUS_AVAILABLE) {
        // Read
        readIssueAtIndex(nkIssue, e.index);
    }
    // Clear 'new' badge from app icon
    Newsstand.applicationIconBadgeNumber = 0;
}

function onWinOpen() {  
    if (Publisher.isReady()) {
        refreshRows();
    } else {
        loadIssues();
    }   
}

// -- Newsstand Events --
Newsstand.addEventListener('progress', function(e){
    Ti.API.info('Download PROGRESS: ' + e.bytesWritten + ' of '  + e.totalBytes);
    // Update progress bar
    rowControllers[e.userInfo.index].updateProgress(e.bytesWritten/e.totalBytes);
});

Newsstand.addEventListener('error', function(e){
    Ti.API.info('ERROR object: ' + JSON.stringify(e));
    refreshRows();

    Ti.UI.createAlertDialog({
        title: 'Error',
        message: e.description,
        buttonNames: ['OK']
    }).show();
});

Newsstand.addEventListener('assetcomplete', function(e){
    var file = Ti.Filesystem.getFile(e.filePath);
    
    Ti.API.info('ASSETCOMPLETE object: ' + JSON.stringify(e));
    Ti.API.info('Asset Download complete and file exists: ' + file.exists());

    refreshRows();
    // Show the 'new' badge on the app icon
    Newsstand.applicationIconBadgeNumber = 1;
    // Update the app icon to show the most recently downloaded issue
    setApplicationIconWithIssueAtIndex(e.userInfo.index);
});

Newsstand.addEventListener('issuecomplete', function(e){
    Ti.API.info('ISSUECOMPLETE for issue named ' + e.name);
    // This event could be used when downloading multiple assets for an issue.
    // If you have multiple assets for an issue, Apple recommends delivering 
    // them in an archive and expanding them on the device rather than having
    // multiple downloads.
});

// -- TableView --
function refreshRows() {
    var issue, nkIssue, statusText, row, rowController, 
        showProgress   = false,
        rows           = [];
        rowControllers = [];

    for (var i =  0, j = Publisher.numberOfIssues(); i < j; i++) {
        issue = Publisher.issueAtIndex(i);
        nkIssue = Newsstand.getIssue({
            name: issue.name 
        });
        if (nkIssue.status == Newsstand.ISSUE_CONTENT_STATUS_DOWNLOADING) {
            showProgress = true;
        } else if (nkIssue.status == Newsstand.ISSUE_CONTENT_STATUS_AVAILABLE) {
            statusText = 'TAP TO READ';
        } else {
            statusText = 'TAP TO DOWNLOAD';
        }

        rowController = Alloy.createController('row', {
            title: issue.title,
            cover: issue.cover,
            name: issue.name,
            status: statusText,
            showProgress: showProgress,
            index: i
        });
        row = rowController.getView();

        // Save the row controllers so we can use them later
        rowControllers.push(rowController);
        rows.push(row);
        showProgress = false;
    }

    $.issueList.data = rows;
}

// -- Issue --
function readIssueAtIndex(nkIssue, index) {
    var issue = Publisher.issueAtIndex(index);

    $.navgroup.open(Alloy.createController('preview', {
        title: issue.title,
        url: nkIssue.contentURL + '/' + issue.name + '.pdf'
    }).getView());

    // Setting the issue that is currently being read
    // Newsstand takes this into account when freeing up flash memory
    Newsstand.currentlyReadingIssue = nkIssue;
}

function downloadIssueAtIndex(nkIssue, index) {
    var issue   = Publisher.issueAtIndex(index),
        content = issue.content,
        name    = issue.name;

    nkIssue.downloadAsset({
        url: content,
        filename: name + '.pdf', // Set the filename of the file to be downloaded
        userInfo: { // userInfo will be available in events for this issue
            index: index,
            name: name
        }
    });

    // Refreshing rows to show that this issue is downloading content
    refreshRows();
}

function setApplicationIconWithIssueAtIndex(index) {
    var issue = Publisher.issueAtIndex(index);
    if (!issue) {
        return;
    }

    // The app icon must be set using a local file.
    // This file will hold the image that is downloaded and will be used to set the app icon.
    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'newIcon.png');

    Network.sendRequest({
        url: issue.cover,
        file: file,
        onload: function(e) {
            if (file.exists()) {
                Newsstand.iconImage = file;
            }
        }
    });
}

// -- Publisher --
function loadIssues() {
    $.activityIndicator.show();

    Publisher.getIssueList({
        successCallback: publisherReady,
        errorCallback: publisherFailed
    });
}

function publisherReady() {
    $.activityIndicator.hide();

    refreshRows();
}

function publisherFailed(e) {
    $.activityIndicator.hide();

    Ti.UI.createAlertDialog({
        title: 'Error',
        message: e.error,
        buttonNames: ['OK']
    }).show();
}

// -- Launch UI --
$.index.open();
