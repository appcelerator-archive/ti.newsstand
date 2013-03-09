/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <Foundation/Foundation.h>
#import <NewsstandKit/NewsstandKit.h>
#import "TiProxy.h"

@interface TiIssue : TiProxy
{
    id delegate;
}
@property(readonly) NKIssue *issue;

@property(readonly) NSString *name;
@property(readonly) NSDate *date;
@property(readonly) NSNumber *status;
@property(readonly) NSURL *contentURL;

-(TiIssue*)initWithIssue:(NKIssue*)issue_ pageContext:(id<TiEvaluator>)context delegate:(id<NSURLConnectionDownloadDelegate>)delegate_;

@end
