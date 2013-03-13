/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <NewsstandKit/NewsstandKit.h>
#import "TiNewsstandIssueProxy.h"
#import "TiNewsstandModule.h"

@implementation TiNewsstandIssueProxy

-(TiNewsstandIssueProxy*)initWithIssue:(NKIssue*)issue_ pageContext:(id<TiEvaluator>)context delegate:(id<NSURLConnectionDownloadDelegate>)delegate_
{
    if (self = [super _initWithPageContext:context]) {
        _issue = [issue_ retain];
        _delegate = [delegate_ retain];
    }
    return self;
}

-(void)dealloc
{
    RELEASE_TO_NIL(_issue);
    RELEASE_TO_NIL(_delegate);
    [super dealloc];
}


#pragma mark Public APIs

-(void)downloadAsset:(id)args
{    
    ENSURE_SINGLE_ARG(args, NSDictionary);
    
    NSString *urlStr = [args objectForKey:@"url"];
    ENSURE_STRING(urlStr);
    
    NSDictionary *userInfoDict = [NSDictionary dictionaryWithDictionary:args];
    NSURL *downloadURL = [NSURL URLWithString: urlStr];
    
    NSURLRequest *req = [NSURLRequest requestWithURL:downloadURL];
    NKAssetDownload *assetDownload = [_issue addAssetWithRequest:req];
    [assetDownload setUserInfo: userInfoDict];
    [assetDownload downloadWithDelegate:_delegate];
}

-(void)removeIssueFromLibrary
{
    [[NKLibrary sharedLibrary] removeIssue:_issue];
}

-(void)setCurrentlyReading
{
    [[NKLibrary sharedLibrary] setCurrentlyReadingIssue:_issue];
}

#pragma mark Properties

-(NSString*)name
{
    return [_issue name];
}

-(NSDate*)date
{
    return [_issue date];
}

-(NSNumber*)status
{
    return [NSNumber numberWithInt:[_issue status]];
}

-(NSString*)contentURL
{
    return [[_issue contentURL] path];
}

@end
