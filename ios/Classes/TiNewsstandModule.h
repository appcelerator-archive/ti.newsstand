/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import "TiModule.h"
#import <NewsstandKit/NewsstandKit.h>

@interface TiNewsstandModule : TiModule <NSURLConnectionDownloadDelegate>
{
    NSString *_username;
    NSString *_password;
}

@end
