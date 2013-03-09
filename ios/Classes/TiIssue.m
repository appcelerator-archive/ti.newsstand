/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import "TiIssue.h"
#import "TiNewsstandModule.h"

static const int timeoutDefault = 30;

@implementation TiIssue

@synthesize issue;

-(TiIssue*)initWithIssue:(NKIssue*)issue_ pageContext:(id<TiEvaluator>)context delegate:(id<NSURLConnectionDownloadDelegate>)delegate_
{
    if (self = [super _initWithPageContext:context])
    {
        issue = [issue_ retain];
        delegate = [delegate_ retain];
    }
    return self;
}

-(void)dealloc
{
    [issue release];
    [delegate release];
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
    NKAssetDownload *assetDownload = [issue addAssetWithRequest:req];
    [assetDownload downloadWithDelegate:delegate];
    [assetDownload setUserInfo: userInfoDict];
}


#pragma mark Properties

-(NSString*)name
{
    return [issue name];
}

-(NSDate*)date
{
    return [issue date];
}

-(NSNumber*)status
{
    return [NSNumber numberWithInt:[issue status]];
}

-(NSString*)contentURL
{
    return [[issue contentURL] path];
}

@end
