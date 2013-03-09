/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = new function ()
{
	// Urls of files to download durring testing
	var assetURL = 'http://appcelerator-eap.s3.amazonaws.com/Modules/Newsstand/images/magazine-0.pdf';
	
	var finish;
	var valueOf;
	var Newsstand;
	
	this.init = function (testUtils)
	{
		finish = testUtils.finish;
		valueOf = testUtils.valueOf;
		Newsstand = require('ti.newsstand');
		
		// Ensure that there are no issues in library before starting tests
		var library = Newsstand.issues;
		for (var i = 0, j = library.length; i < j; i++) {
			Newsstand.removeIssue(library.pop());
		}
	};

	this.name = "newsstand";
	
	// ---------------------------------------------------------------
	// Newsstand
	// ---------------------------------------------------------------

	// Test that module is loaded
	this.testModule = function (testRun)
	{
		// Verify that the module is defined
		valueOf(testRun, Newsstand).shouldBeObject();
		finish(testRun);
	};
	
	// Test that all of the Constants are defined
	this.testConstants = function (testRun)
	{
		valueOf(testRun, Newsstand.ISSUE_CONTENT_STATUS_NONE).shouldBeNumber();
		valueOf(testRun, Newsstand.ISSUE_CONTENT_STATUS_DOWNLOADING).shouldBeNumber();
		valueOf(testRun, Newsstand.ISSUE_CONTENT_STATUS_AVAILABLE).shouldBeNumber();

		finish(testRun);
	};
	
	// Test that all of the Functions are defined
	this.testFunctions = function (testRun)
	{
		valueOf(testRun, Newsstand.enableDevMode).shouldBeFunction();
		valueOf(testRun, Newsstand.addIssue).shouldBeFunction();
		valueOf(testRun, Newsstand.removeIssue).shouldBeFunction();
		valueOf(testRun, Newsstand.getIssue).shouldBeFunction();
		valueOf(testRun, Newsstand.setBasicAuthentication).shouldBeFunction();

		finish(testRun);
	};
	
	// Test that all of the Properties are defined
	this.testProperties = function (testRun)
	{
		valueOf(testRun, Newsstand.issues).shouldBeArray(); //read only
		valueOf(testRun, Newsstand.setCurrentlyReadingIssue).shouldBeFunction();
		valueOf(testRun, Newsstand.currentlyReadingIssue).shouldBeUndefined();
		valueOf(testRun, Newsstand.setApplicationIconBadgeNumber).shouldBeFunction();
		valueOf(testRun, Newsstand.applicationIconBadgeNumber).shouldBeNumber();
		valueOf(testRun, Newsstand.setIconImage).shouldBeFunction(); //write only

		finish(testRun);
	};
	
	this.testEnableDevMode = function (testRun)
	{
		valueOf(testRun, function() {
			Newsstand.enableDevMode();
		}).shouldNotThrowException();

		finish(testRun);
	};
	
	this.testIssueProxy = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		valueOf(testRun, issue.name).shouldBeString();
		valueOf(testRun, issue.date.getTime()).shouldBe(date.getTime());
		valueOf(testRun, issue.status).shouldBeNumber();
		valueOf(testRun, issue.contentURL).shouldBeString();
		valueOf(testRun, issue.downloadAsset).shouldBeFunction();
		
		// Clean up
		Newsstand.removeIssue(issue);

		finish(testRun);
	};
	
	this.testIssueProxyWithRemovedIssue = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.removeIssue(issue);
		
		valueOf(testRun, issue.name).shouldNotBeUndefined();
		valueOf(testRun, issue.date).shouldNotBeUndefined();
		valueOf(testRun, issue.status).shouldNotBeUndefined();
		valueOf(testRun, issue.contentURL).shouldBeUndefined();
		valueOf(testRun, issue.downloadAsset).shouldBeFunction();

		finish(testRun);
	};
	
	this.testAddIssue = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		valueOf(testRun, issue).shouldBeObject();
		
		// Cleanup
		Newsstand.removeIssue(issue);

		finish(testRun);
	};	
	
	this.testAddIssueInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Newsstand.addIssue();
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({
				name: 'test-issue'
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({
				date: new Date()
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({
				name: null,
				date: new Date()
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({
				name: 5,
				date: new Date()
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({
				name: 'test-issue',
				date: null
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({
				name: 'test-issue',
				date: '2013-1-1'
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.addIssue({
				name: 'test-issue',
				date: 1234
			});
		}).shouldThrowException();

		finish(testRun);
	};
	
	this.testAddIssueDuplicate = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		valueOf(testRun, issue).shouldBeObject();
		
		var issue2 = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		valueOf(testRun, issue2).shouldBeUndefined();
		valueOf(testRun, issue).shouldBeObject();
		valueOf(testRun, issue.name).shouldBe(name);
		
		// Cleanup
		Newsstand.removeIssue(issue);

		finish(testRun);
	};

	this.testRemoveIssue = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.removeIssue(issue);
		
		var issue2 = Newsstand.getIssue({
			name: name
		});
		
		valueOf(testRun, issue2).shouldBeUndefined();

		finish(testRun);
	};
	
	this.testRemoveIssueInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Newsstand.removeIssue();
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.removeIssue({});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.removeIssue({
				name: 'test-issue'
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.removeIssue(null);
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.removeIssue('test-issue');
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.removeIssue(5);
		}).shouldThrowException();

		finish(testRun);
	};
	
	this.testRemoveIssueAlreadyRemoved = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.removeIssue(issue);
		
		valueOf(testRun, function() {
			Newsstand.removeIssue(issue);
		}).shouldNotThrowException();

		finish(testRun);
	};

	this.testGetIssue = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		var issue2 = Newsstand.getIssue({
			name: name
		});
		
		valueOf(testRun, issue2.name).shouldBeString();
		valueOf(testRun, issue2.date.getTime()).shouldBe(date.getTime());
		valueOf(testRun, issue2.status).shouldBe(Newsstand.ISSUE_CONTENT_STATUS_NONE);
		valueOf(testRun, issue2.contentURL).shouldBeString();
		valueOf(testRun, issue2.downloadAsset).shouldBeFunction();
		
		// Clean up
		Newsstand.removeIssue(issue);

		finish(testRun);
	};
	
	this.testGetIssueInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Newsstand.getIssue();
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.getIssue({});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.getIssue({
				name: null
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.getIssue(null);
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.getIssue('test-issue');
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.getIssue(5);
		}).shouldThrowException();

		finish(testRun);
	};
	
	this.testGetIssueNotInLibrary = function (testRun)
	{
		var name = 'test-issue';
		
		var issue = Newsstand.getIssue({
			name: name
		});
		
		valueOf(testRun, issue).shouldBeUndefined();

		finish(testRun);
	};
	
	this.testCurrentlyReadingIssue = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		valueOf(testRun, Newsstand.currentlyReadingIssue).shouldBeUndefined();
		
		Newsstand.currentlyReadingIssue = issue;
		
		valueOf(testRun, Newsstand.currentlyReadingIssue).shouldBeObject();
		valueOf(testRun, Newsstand.currentlyReadingIssue.name).shouldBe(name);
		
		// Clean up
		Newsstand.removeIssue(issue);

		valueOf(testRun, Newsstand.currentlyReadingIssue).shouldBeUndefined();

		finish(testRun);
	};
	
	this.testCurrentlyReadingIssueInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Newsstand.currentlyReadingIssue = undefined;
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.currentlyReadingIssue = null;
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.currentlyReadingIssue = 'test-issue';
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.currentlyReadingIssue = 5;
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.currentlyReadingIssue = [];
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.currentlyReadingIssue = {};
		}).shouldThrowException();

		finish(testRun);
	};
	
	this.testApplicationIconBadgeNumber = function (testRun)
	{
		valueOf(testRun, Newsstand.applicationIconBadgeNumber).shouldBeNumber();
		
		Newsstand.applicationIconBadgeNumber = 2;		
		valueOf(testRun, Newsstand.applicationIconBadgeNumber).shouldBe(2);
		
		Newsstand.applicationIconBadgeNumber = 0;
		valueOf(testRun, Newsstand.applicationIconBadgeNumber).shouldBe(0);

		finish(testRun);
	};
	
	this.testApplicationIconBadgeNumberInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Newsstand.applicationIconBadgeNumber = undefined;
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.applicationIconBadgeNumber = null;
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.applicationIconBadgeNumber = 'test-issue';
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.applicationIconBadgeNumber = [];
		}).shouldThrowException();
		valueOf(testRun, function() {
			Newsstand.applicationIconBadgeNumber = {};
		}).shouldThrowException();

		finish(testRun);
	};
	
	this.testDownloadAsset = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('assetcomplete', function(e) {
			valueOf(testRun, e).shouldBeObject();
			
			var filename = e.filePath.split('/').pop();
			var lastPathComponent = assetURL.split('/').pop()
			valueOf(testRun, filename).shouldBe(lastPathComponent);
			
			var file =  Ti.Filesystem.getFile(e.filePath);
			valueOf(testRun, file.exists()).shouldBeTrue();
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL
		});
	};
	
	this.testDownloadAssetInvalidArguments = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		valueOf(testRun, function() {
			issue.downloadAsset();
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset({});
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset([]);
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset(null);
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset({
				url: null
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset({
				url: undefined
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset({
				url: 8675309
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset({
				url: []
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			issue.downloadAsset({
				url: {}
			});
		}).shouldThrowException();

		// Clean up
		Newsstand.removeIssue(issue);

		finish(testRun);
	};

	this.testDownloadAssetWithFilename = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('assetcomplete', function(e) {
			valueOf(testRun, e).shouldBeObject();
			
			var filename = e.filePath.split('/').pop();
			valueOf(testRun, filename).shouldBe('Test.file');
			
			var file =  Ti.Filesystem.getFile(e.filePath);
			valueOf(testRun, file.exists()).shouldBeTrue();
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL,
			filename: 'Test.file'
		});
	};
	
	this.testDownloadAssetWithUserInfo = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('assetcomplete', function(e) {
			valueOf(testRun, e).shouldBeObject();
			valueOf(testRun, e.userInfo).shouldBeObject();
			valueOf(testRun, e.userInfo.id).shouldBe(21);
			valueOf(testRun, e.userInfo.someString).shouldBe('test');
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL,
			userInfo: {
				id: 21,
				someString: 'test'
			}
		});
	};
	
	this.testDownloadAssetWithFilenameUserInfo = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('assetcomplete', function(e) {
			valueOf(testRun, e).shouldBeObject();
			valueOf(testRun, e.userInfo).shouldBeObject();
			valueOf(testRun, e.userInfo.id).shouldBe(21);
			valueOf(testRun, e.userInfo.someString).shouldBe('test');
			
			var filename = e.filePath.split('/').pop();
			valueOf(testRun, filename).shouldBe('Test.file');
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL,
			filename: 'Test.file',
			userInfo: {
				id: 21,
				someString: 'test'
			}
		});
	};
	
	this.testDownloadAssetProgressEvent = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('progress', function(e) {
			valueOf(testRun, e).shouldBeObject();
			valueOf(testRun, e.name).shouldBe(name);
			valueOf(testRun, e.userInfo).shouldBeObject();
			valueOf(testRun, e.bytesWritten).shouldBeNumber();
			valueOf(testRun, e.totalBytes).shouldBeNumber();
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL
		});
	};	
	
	this.testDownloadAssetIssueCompleteEvent = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('issuecomplete', function(e) {
			valueOf(testRun, e).shouldBeObject();
			valueOf(testRun, e.name).shouldBe(name);
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL
		});
	};
	
	this.testIssueStatus = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		valueOf(testRun, issue.status).shouldBe(Newsstand.ISSUE_CONTENT_STATUS_NONE);
		
		Newsstand.addEventListener('progress', function(e) {
			valueOf(testRun, issue.status).shouldBe(Newsstand.ISSUE_CONTENT_STATUS_DOWNLOADING);
		});
		
		Newsstand.addEventListener('issuecomplete', function(e) {
			valueOf(testRun, issue.status).shouldBe(Newsstand.ISSUE_CONTENT_STATUS_AVAILABLE);
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL
		});
	};

	// Populate the array of tests based on the 'hammer' convention
	this.tests = require('hammer').populateTests(this);
};
