/**
 * Ti.Newsstand Module
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE included with this distribution for details.
 */

#import <Foundation/Foundation.h>
#import "TiProxy.h"

@interface TiNewsstandIssueProxy : TiProxy
{
    @private
    id _delegate;
    NKIssue *_issue;
}
@property(readonly, nonatomic) NSString *name;
@property(readonly, nonatomic) NSDate *date;
@property(readonly, nonatomic) NSNumber *status;
@property(readonly, nonatomic) NSURL *contentURL;

-(TiNewsstandIssueProxy*)initWithIssue:(NKIssue*)issue_ pageContext:(id<TiEvaluator>)context delegate:(id<NSURLConnectionDownloadDelegate>)delegate_;

-(void)removeIssueFromLibrary;
-(void)setCurrentlyReading;

@end
