/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <Foundation/Foundation.h>
#import "TiModule.h"

@interface TiNewsstandModule : TiModule <NSURLConnectionDownloadDelegate>
{
    
}
@property(readwrite, nonatomic, copy) NSString *username;
@property(readwrite, nonatomic, copy) NSString *password;


@end
