/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <NewsstandKit/NewsstandKit.h>
#import "TiNewsstandModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiNewsstandIssueProxy.h"

@implementation TiNewsstandModule

@synthesize username, password;

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
    return @"21c03409-3f8c-41db-bf41-d45eaa784f17";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
    return @"ti.newsstand";
}

#pragma mark Lifecycle

-(void)startup
{
    // this method is called when the module is first loaded
    // you *must* call the superclass
    [super startup];

    // Pending downloads must be reconnected when the app starts or they will be cancelled
    [self checkForPendingDownloads];
    
    NSLog(@"[INFO] %@ loaded",self);
}

-(void)shutdown:(id)sender
{
    // this method is called when the module is being unloaded
    // typically this is during shutdown. make sure you don't do too
    // much processing here or the app will be quit forceably
    
    // you *must* call the superclass
    [super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc
{
    username = nil;
    password = nil;
    [super dealloc];
}

#pragma mark Internal Memory Management

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
    // optionally release any resources that can be dynamically
    // reloaded once memory is available - such as caches
    [super didReceiveMemoryWarning:notification];
}

#pragma mark Public APIs

MAKE_SYSTEM_PROP(ISSUE_CONTENT_STATUS_NONE, NKIssueContentStatusNone);
MAKE_SYSTEM_PROP(ISSUE_CONTENT_STATUS_DOWNLOADING, NKIssueContentStatusDownloading);
MAKE_SYSTEM_PROP(ISSUE_CONTENT_STATUS_AVAILABLE, NKIssueContentStatusAvailable);

// Removes the once per day throttle from news stand notifications
-(void)enableDevMode:(id)args
{
   [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"NKDontThrottleNewsstandContentNotifications"];
    NSLog(@"[INFO] Dev mode enabled");
}

-(TiNewsstandIssueProxy*)addIssue:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    
    NSString *name  = [args objectForKey:@"name"];
    NSDate *date    = [args objectForKey:@"date"];
    
    ENSURE_TYPE(name, NSString);
    ENSURE_TYPE(date, NSDate);
    
    // An exception is thrown if the issue already exists, and the rest of the js function
    // is not executed if we let it fail naturally
    if ([[NKLibrary sharedLibrary] issueWithName:name]) {
        NSLog(@"[ERROR] there is already an issue for this name -> '%@'",name);
        return nil;
    }
    
    NKIssue *nkIssue = [[NKLibrary sharedLibrary] addIssueWithName:name date:date];
    // nkIssue could be nil if the instance couldn’t be created
    if (nkIssue == nil) {
        NSLog(@"[ERROR] issue named '%@' could not be created",name);
        return nil;
    }
    
    return [[[TiNewsstandIssueProxy alloc] initWithIssue:nkIssue pageContext:[self executionContext] delegate:self] autorelease];
}

-(void)removeIssue:(id)args
{
    ENSURE_SINGLE_ARG(args, TiNewsstandIssueProxy);
    [args removeIssueFromLibrary];
}

-(TiNewsstandIssueProxy*)getIssue:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    
    NSString *name = [args objectForKey:@"name"];
    
    ENSURE_STRING(name);
    
    NKIssue *nkIssue = [[NKLibrary sharedLibrary] issueWithName:name];
    // nkIssue my be nil if the issue couldn't be retrieved
    if (nkIssue == nil) {
        NSLog(@"[ERROR] Issue named '%@' does not exist in library",name);
        return nil;
    }
    
    return [[[TiNewsstandIssueProxy alloc] initWithIssue:nkIssue pageContext:[self executionContext] delegate:self] autorelease];
}

// Set the username and password that will be used to authenticate if downloadAsset requires basic auth
-(void)setBasicAuthentication:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    
    NSString *user;
    NSString *pass;
    
    ENSURE_ARG_FOR_KEY(user, args, @"username", NSString);
    ENSURE_ARG_FOR_KEY(pass, args, @"password", NSString);
    
    self.username = user;
    self.password = pass;
}

#pragma mark Properties

-(NSArray*)issues
{
    NSArray *issues = [[NKLibrary sharedLibrary] issues];
    NSMutableArray *result = [NSMutableArray arrayWithCapacity:[issues count]];
    [issues enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop){
        [result addObject:[[[TiNewsstandIssueProxy alloc] initWithIssue:obj pageContext:[self executionContext] delegate:self] autorelease]];
    }];
    
    return result;
}

-(void)setCurrentlyReadingIssue:(id)args
{
    ENSURE_SINGLE_ARG(args, TiNewsstandIssueProxy);
    [args setCurrentlyReading];
}

-(TiNewsstandIssueProxy*)currentlyReadingIssue
{
    NKIssue *nkIssue = [[NKLibrary sharedLibrary] currentlyReadingIssue];
    return nkIssue ? [[[TiNewsstandIssueProxy alloc] initWithIssue:nkIssue pageContext:[self executionContext] delegate:self] autorelease] : nil;
}

-(void)setIconImage:(id)args
{
    ENSURE_SINGLE_ARG(args, TiFile);
    
    NSString *path = [args path];
    
    NSLog(@"[INFO] Updating app icon with image at: %@",path);
    
    UIImage *newcover = [UIImage imageWithContentsOfFile:path];
    [[UIApplication sharedApplication] setNewsstandIconImage:newcover];
}

// Will display the "new" badge if number is greater than 0
-(void)setApplicationIconBadgeNumber:(id)args
{
    ENSURE_SINGLE_ARG(args, NSNumber);

    NSLog(@"[INFO] Setting app badge number to %@",args);
    
    [[UIApplication sharedApplication] setApplicationIconBadgeNumber:[args integerValue]];
}

-(NSNumber*)applicationIconBadgeNumber
{
    return [NSNumber numberWithInteger:[[UIApplication sharedApplication]applicationIconBadgeNumber]];
}

#pragma mark - NSURLConnectionDownloadDelegate

-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    [self fireErrorEvent:connection error:error];
}

- (void)connection:(NSURLConnection *)connection didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge
{
    if ([challenge previousFailureCount] != 0) {
        [[challenge sender] cancelAuthenticationChallenge:challenge];
        return;
    }
    
    NSURLCredential *newCredential = [NSURLCredential credentialWithUser:self.username
                                                                password:self.password
                                                             persistence:NSURLCredentialPersistenceNone];
    
    [[challenge sender] useCredential:newCredential forAuthenticationChallenge:challenge];
    NSLog(@"[INFO] Responded to authentication challenge");
}

-(void)connection:(NSURLConnection *)connection didWriteData:(long long)bytesWritten totalBytesWritten:(long long)totalBytesWritten expectedTotalBytes:(long long)expectedTotalBytes
{
    [self fireProgressEvent:connection totalBytesWritten:totalBytesWritten expectedTotalBytes:expectedTotalBytes];
}

-(void)connectionDidResumeDownloading:(NSURLConnection *)connection totalBytesWritten:(long long)totalBytesWritten expectedTotalBytes:(long long)expectedTotalBytes
{
    [self fireProgressEvent:connection totalBytesWritten:totalBytesWritten expectedTotalBytes:expectedTotalBytes];
}

-(void)connectionDidFinishDownloading:(NSURLConnection *)connection destinationURL:(NSURL *)destinationURL
{
    NKAssetDownload *dnl        = connection.newsstandAssetDownload;
    NKIssue *nkIssue            = dnl.issue;
    
    NSString *tempFileName      = [[dnl userInfo] objectForKey:@"filename"]; // use filename provided in userInfo if it exists
    NSString *fileName          = (tempFileName) ? tempFileName : [[dnl.URLRequest URL] lastPathComponent];
    NSString *filePath          = [[nkIssue.contentURL path] stringByAppendingPathComponent:fileName];
    NSError *error              = nil;
    
    NSLog(@"[INFO] File is being copied to %@",filePath);
    if ([[NSFileManager defaultManager] fileExistsAtPath:filePath]) {        
        NSLog(@"[WARN] Overwriting file named '%@'. See module documentation to learn how to specify a downloaded file's filename.",fileName);
        if ([[NSFileManager defaultManager] removeItemAtPath:filePath error:&error] == NO) {
            [self fireErrorEvent:connection error:error];
            return;
        }
    }
    
    if ([[NSFileManager defaultManager] moveItemAtPath:[destinationURL path] toPath:filePath error:&error] == NO) {
        [self fireErrorEvent:connection error:error];
        return;
    }
    
    [self fireAssetCompleteEvent:connection filePath:filePath];
}

#pragma mark Listener Notifications

-(void)_listenerAdded:(NSString *)type count:(int)count
{
    if (count == 1 && [type isEqualToString:@"issuecomplete"]) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(issueDownloadComplete:) name:NKIssueDownloadCompletedNotification object:nil];
    }
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
    if (count == 0 && [type isEqualToString:@"issuecomplete"]) {
        [[NSNotificationCenter defaultCenter] removeObserver:self];
    }
}

#pragma mark Observers

-(void)issueDownloadComplete:(NSNotification *)note
{
    [self fireIssueCompleteEvent:note];
}

#pragma mark Fire Events

-(void)fireErrorEvent:(NSURLConnection *)connection error:(NSError *)error
{
    if ([self _hasListeners:@"error"]) {
        NKAssetDownload *dnl        = connection.newsstandAssetDownload;
        NSDictionary *userInfo      = [[dnl userInfo] objectForKey:@"userInfo"];
        userInfo = userInfo ? userInfo : [NSDictionary dictionary]; // userInfo can not be nil when added to dictionary
        
        NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
                               [[dnl issue] name], @"name",
                               userInfo, @"userInfo",
                               [error localizedDescription], @"description",
                               [NSNumber numberWithInteger:[error code]], @"code",
                               nil
                               ];
        [self fireEvent:@"error" withObject:event];
    }
}

-(void)fireProgressEvent:(NSURLConnection *)connection totalBytesWritten:(long long)totalBytesWritten expectedTotalBytes:(long long)expectedTotalBytes
{
    if ([self _hasListeners:@"progress"]) {
        NKAssetDownload *dnl    = connection.newsstandAssetDownload;
        NSDictionary *userInfo  = [[dnl userInfo] objectForKey:@"userInfo"];
        userInfo = userInfo ? userInfo : [NSDictionary dictionary]; // userInfo can not be nil when added to dictionary
        
        NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
                               [[dnl issue] name], @"name",
                               userInfo, @"userInfo",
                               [NSNumber numberWithFloat: totalBytesWritten], @"bytesWritten",
                               [NSNumber numberWithFloat: expectedTotalBytes], @"totalBytes",
                               nil
                               ];
        
        [self fireEvent:@"progress" withObject:event];
    }
}

-(void)fireAssetCompleteEvent:(NSURLConnection *)connection filePath:(NSString *)filePath
{
    if ([self _hasListeners:@"assetcomplete"]) {
        NKAssetDownload *dnl        = connection.newsstandAssetDownload;
        NSDictionary *userInfo      = [[dnl userInfo] objectForKey:@"userInfo"];
        userInfo = userInfo ? userInfo : [NSDictionary dictionary]; // userInfo can not be nil when added to dictionary
        
        NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
                               [[dnl issue] name], @"name",
                               userInfo, @"userInfo",
                               filePath, @"filePath",
                               nil
                               ];
        [self fireEvent:@"assetcomplete" withObject:event];
    }
}

-(void)fireIssueCompleteEvent:(NSNotification *)note
{
    // Not checking for _hasListeners here because this method will only be called
    // if there is a listener, see _listenerAdded:count: and _listenerRemoved:count:
    NSDictionary *event = [NSDictionary dictionaryWithObject:[[note object] name] forKey:@"name"];
    [self fireEvent:@"issuecomplete" withObject:event];
}

#pragma mark Utils

// The downloadingAssets array holds any downloading assets for any issues.
// (A downloading asset is represented by a NKAssetDownload object.) A newsstand content
// application should, when it launches, iterate through this array and call
// downloadWithDelegate: on each item to have the downloaded assets completely processed.
// If this is not done at launch, the downloads will be canceled.
-(void)checkForPendingDownloads
{
    for(NKAssetDownload *asset in [[NKLibrary sharedLibrary] downloadingAssets]) {
        [asset downloadWithDelegate:self];
    }
}

@end
