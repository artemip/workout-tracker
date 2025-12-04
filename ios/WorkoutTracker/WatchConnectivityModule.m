//
//  WatchConnectivityModule.m
//  WorkoutTracker
//
//  Objective-C bridge for WatchConnectivityModule
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(WatchConnectivityModule, RCTEventEmitter)

RCT_EXTERN_METHOD(isWatchPaired:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isWatchReachable:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendWorkoutState:(NSDictionary *)state)

RCT_EXTERN_METHOD(sendWorkoutStarted:(NSDictionary *)workoutData)

RCT_EXTERN_METHOD(sendWorkoutEnded)

@end

