/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import "TiNewsstandModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiIssue.h"

@implementation TiNewsstandModule

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
    [_username release];
    [_password release];
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

-(TiIssue*)addIssue:(id)args
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
    if (nkIssue)
    {
        return [[[TiIssue alloc] initWithIssue:nkIssue pageContext:[self executionContext] delegate:self] autorelease];
    }
    else
    {
        return nil;
    }
}

-(void)removeIssue:(id)args
{
    ENSURE_SINGLE_ARG(args, TiIssue);
    [[NKLibrary sharedLibrary] removeIssue:[args issue]];
}

-(TiIssue*)getIssue:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    
    NSString *name = [args objectForKey:@"name"];
    
    ENSURE_STRING(name);
    
    NKIssue *nkIssue = [[NKLibrary sharedLibrary] issueWithName:name];
    if (nkIssue)
    {
        return [[[TiIssue alloc] initWithIssue:nkIssue pageContext:[self executionContext] delegate:self] autorelease];
    }
    else
    {
        NSLog(@"[ERROR] Issue named '%@' does not exist in library",name);
        return nil;
    }
}

// Set the username and password that will be used to authenticate if downloadAsset requires basic auth
-(void)setBasicAuthentication:(id)args
{
    ENSURE_SINGLE_ARG(args, NSDictionary);
    
    NSString *user  = [args objectForKey:@"username"];
    NSString *pass  = [args objectForKey:@"password"];
    
    ENSURE_STRING(user);
    ENSURE_STRING(pass);
    
    [_username release];
    [_password release];
    
    _username = [user retain];
    _password = [pass retain];
}

#pragma mark Properties

-(NSArray*)issues
{
    NSArray *issues = [[NKLibrary sharedLibrary] issues];
    NSMutableArray *result = [NSMutableArray array];
    [issues enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop){
        [result addObject:[[[TiIssue alloc] initWithIssue:obj pageContext:[self executionContext] delegate:self] autorelease]];
    }];
    
    return result;
}

-(void)setCurrentlyReadingIssue:(id)args
{
    ENSURE_SINGLE_ARG(args, TiIssue);
    [[NKLibrary sharedLibrary] setCurrentlyReadingIssue:[args issue]];
}

-(TiIssue*)currentlyReadingIssue
{
    NKIssue *nkIssue = [[NKLibrary sharedLibrary] currentlyReadingIssue];
    return nkIssue ? [[[TiIssue alloc] initWithIssue:nkIssue pageContext:[self executionContext] delegate:self] autorelease] : nil;
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
    ENSURE_TYPE(args, NSNumber);

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
    NKAssetDownload *dnl        = connection.newsstandAssetDownload;
    NKIssue *nkIssue            = dnl.issue;
    NSString *errorDescription  = [error localizedDescription];
    NSNumber *errorCode         = [NSNumber numberWithInteger:[error code]];
    NSDictionary *userInfo      = [[dnl userInfo] objectForKey:@"userInfo"];
    userInfo = userInfo ? userInfo : [NSDictionary dictionary]; // userInfo can not be nil when added to dictionary
    
    if ([self _hasListeners:@"error"])
    {
        NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
                               [nkIssue name], @"name",
                               userInfo, @"userInfo",
                               errorDescription, @"description",
                               errorCode, @"code",
                               nil
                               ];
        [self fireEvent:@"error" withObject:event];
    }
}

- (void)connection:(NSURLConnection *)connection didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge
{
    if ([challenge previousFailureCount] == 0) {
        NSLog(@"[INFO] Received authentication challenge");
        NSURLCredential *newCredential = [NSURLCredential credentialWithUser:_username
                                                                    password:_password
                                                                 persistence:NSURLCredentialPersistenceNone];
        
        [[challenge sender] useCredential:newCredential forAuthenticationChallenge:challenge];
        NSLog(@"[INFO] Responded to authentication challenge");
    }
    else {
        [[challenge sender] cancelAuthenticationChallenge:challenge];
    }
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
    NSDictionary *userInfo      = [[dnl userInfo] objectForKey:@"userInfo"];
    userInfo = userInfo ? userInfo : [NSDictionary dictionary]; // userInfo can not be nil when added to dictionary
    
    NSString *tempFileName      = [[dnl userInfo] objectForKey:@"filename"]; // use filename provided in userInfo if it exists
    NSString *fileName          = (tempFileName) ? tempFileName : [[dnl.URLRequest URL] lastPathComponent];
    NSString *filePath       = [[nkIssue.contentURL path] stringByAppendingPathComponent:fileName];
    NSError *moveError          = nil;
    NSError *removeError        = nil;
    
    void (^fireErrorEvent)(NSError*) = ^(NSError *error) {
        NSString *errorCode         = [NSString stringWithFormat:@"%d", error.code];
        NSString *errorDescription  = [NSString stringWithFormat:@"%@", error.localizedDescription];
        
        if ([self _hasListeners:@"error"])
        {
            NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
                                   [nkIssue name], @"name",
                                   userInfo, @"userInfo",
                                   errorDescription, @"description",
                                   errorCode, @"code",
                                   nil
                                   ];
            [self fireEvent:@"error" withObject:event];
        }
    };
    
    NSLog(@"[INFO] File is being copied to %@",filePath);
    if ([[NSFileManager defaultManager] fileExistsAtPath:filePath])
    {        
        NSLog(@"[ERROR] Overwriting file named '%@'. See module documentation to learn how to specify a downloaded file's filename.",fileName);
        if ([[NSFileManager defaultManager] removeItemAtPath:filePath error:&removeError] == NO)
        {
            fireErrorEvent(removeError);
        }
    }
    
    if ([[NSFileManager defaultManager] moveItemAtPath:[destinationURL path] toPath:filePath error:&moveError] == NO)
    {
        fireErrorEvent(moveError);
    }
    else
    {
        if ([self _hasListeners:@"assetcomplete"])
        {
            NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
                                   [nkIssue name], @"name",
                                   userInfo, @"userInfo",
                                   filePath, @"filePath",
                                   nil
                                   ];
            [self fireEvent:@"assetcomplete" withObject:event];
        }
    }
}

#pragma mark Listener Notifications

-(void)_listenerAdded:(NSString *)type count:(int)count
{
    if (count == 1 && [type isEqualToString:@"issuecomplete"])
    {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(issueDownloadComplete:) name:NKIssueDownloadCompletedNotification object:nil];
    }
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
    if (count == 0 && [type isEqualToString:@"issuecomplete"])
    {
        [[NSNotificationCenter defaultCenter] removeObserver:self];
    }
}

#pragma mark Observers

-(void)issueDownloadComplete:(NSNotification *)note
{
    NSDictionary *event = [NSDictionary dictionaryWithObject:[[note object] name] forKey:@"name"];
    [self fireEvent:@"issuecomplete" withObject:event];
}

#pragma mark Utils

-(void)fireProgressEvent:(NSURLConnection *)connection totalBytesWritten:(long long)totalBytesWritten expectedTotalBytes:(long long)expectedTotalBytes
{
    if ([self _hasListeners:@"progress"])
    {
        NKAssetDownload *dnl    = connection.newsstandAssetDownload;
        NSDictionary *userInfo  = [[dnl userInfo] objectForKey:@"userInfo"];
        userInfo = userInfo ? userInfo : [NSDictionary dictionary]; // userInfo can not be nil when added to dictionary
        
        NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
                               [NSNumber numberWithFloat: totalBytesWritten], @"bytesWritten",
                               [NSNumber numberWithFloat: expectedTotalBytes], @"totalBytes",
                               [[dnl issue] name], @"name",
                               userInfo, @"userInfo",
                               nil
                               ];
        
        [self fireEvent:@"progress" withObject:event];
    }
}

// Pending downloads must be reconnected when the app starts or they will be cancelled
-(void)checkForPendingDownloads
{
    for(NKAssetDownload *asset in [[NKLibrary sharedLibrary] downloadingAssets])
    {
        [asset downloadWithDelegate:self];
    }
}

@end
