/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = new function ()
{
	// Urls of files to download durring testing
	var assetURL		= Ti.App.Properties.getString('basic_auth.url');
	// Creds to test
	var username		= Ti.App.Properties.getString('basic_auth.username');
	var password		= Ti.App.Properties.getString('basic_auth.password');
	var bad_username	= Ti.App.Properties.getString('basic_auth.bad_username');
	var bad_password	= Ti.App.Properties.getString('basic_auth.bad_password');
	
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

	this.name = "auth";
	
	// ---------------------------------------------------------------
	// Auth
	// ---------------------------------------------------------------
	
	this.testWithOutCreds = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('error', function(e) {
			valueOf(testRun, e).shouldBeObject();
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		issue.downloadAsset({
			url: assetURL
		});
	};
	
	this.testBasicAuthenticationBadCreds = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('error', function(e) {
			valueOf(testRun, e).shouldBeObject();
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		Newsstand.setBasicAuthentication({
			username: bad_username,
			password: bad_password
		});
		
		issue.downloadAsset({
			url: assetURL
		});
	};
	
	// Successful call must be done last. 
	// If the Authentication is successful, the server sets a cookie 
	// so subsequent calls use the successful username and password.
	this.testBasicAuthentication = function (testRun)
	{
		var name = 'test-issue';
		var date = new Date();
		var issue = Newsstand.addIssue({
			name: name,
			date: date
		});
		
		Newsstand.addEventListener('assetcomplete', function(e) {
			valueOf(testRun, e).shouldBeObject();
			
			// Clean up
			Newsstand.removeIssue(issue);

			finish(testRun);
		});
		
		Newsstand.setBasicAuthentication({
			username: username,
			password: password
		});
		
		issue.downloadAsset({
			url: assetURL
		});
	};

	// Populate the array of tests based on the 'hammer' convention
	this.tests = require('hammer').populateTests(this);
};
