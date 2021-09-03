/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RNCPushNotificationIOS.h"
#import "RCTConvert+Notification.h"
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>

NSString *const RCTRemoteNotificationReceived = @"RemoteNotificationReceived";

static NSString *const kLocalNotificationReceived = @"LocalNotificationReceived";
static NSString *const kRemoteNotificationsRegistered = @"RemoteNotificationsRegistered";
static NSString *const kRemoteNotificationRegistrationFailed = @"RemoteNotificationRegistrationFailed";

static NSString *const kErrorUnableToRequestPermissions = @"E_UNABLE_TO_REQUEST_PERMISSIONS";

#if !TARGET_OS_TV
@interface RNCPushNotificationIOS ()
@property (nonatomic, strong) NSMutableDictionary *remoteNotificationCallbacks;
@end


#else
@interface RNCPushNotificationIOS () <NativePushNotificationManagerIOS>
@end
#endif //TARGET_OS_TV

@implementation RNCPushNotificationIOS

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

#if !TARGET_OS_TV
- (void)startObserving
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleLocalNotificationReceived:)
                                               name:kLocalNotificationReceived
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteNotificationReceived:)
                                               name:RCTRemoteNotificationReceived
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteNotificationsRegistered:)
                                               name:kRemoteNotificationsRegistered
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteNotificationRegistrationError:)
                                               name:kRemoteNotificationRegistrationFailed
                                             object:nil];
}

- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"localNotificationReceived",
           @"remoteNotificationReceived",
           @"remoteNotificationsRegistered",
           @"remoteNotificationRegistrationError"];
}

+ (void)didRegisterUserNotificationSettings:(__unused UIUserNotificationSettings *)notificationSettings
{
}

+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  NSMutableString *hexString = [NSMutableString string];
  NSUInteger deviceTokenLength = deviceToken.length;
  const unsigned char *bytes = deviceToken.bytes;
  for (NSUInteger i = 0; i < deviceTokenLength; i++) {
    [hexString appendFormat:@"%02x", bytes[i]];
  }
  [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteNotificationsRegistered
                                                      object:self
                                                    userInfo:@{@"deviceToken" : [hexString copy]}];
}

+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteNotificationRegistrationFailed
                                                      object:self
                                                    userInfo:@{@"error": error}];
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)notification
{
  NSDictionary *userInfo = @{@"notification": notification};
  [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                      object:self
                                                    userInfo:userInfo];
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)notification
              fetchCompletionHandler:(RNCRemoteNotificationCallback)completionHandler
{
  NSDictionary *userInfo = @{@"notification": notification, @"completionHandler": completionHandler};
  [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                      object:self
                                                    userInfo:userInfo];
}

+ (void)didReceiveLocalNotification:(UILocalNotification *)notification
{
    [[NSNotificationCenter defaultCenter] postNotificationName:kLocalNotificationReceived
                                                      object:self
                                                    userInfo:[RCTConvert RCTFormatLocalNotification:notification]];
}

+ (void)didReceiveNotificationResponse:(UNNotificationResponse *)response
API_AVAILABLE(ios(10.0)) {
    [[NSNotificationCenter defaultCenter] postNotificationName:kLocalNotificationReceived
                                                      object:self
                                                    userInfo:[RCTConvert RCTFormatUNNotificationResponse:response]];
}

- (void)handleLocalNotificationReceived:(NSNotification *)notification
{
  [self sendEventWithName:@"localNotificationReceived" body:notification.userInfo];
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification
{
  NSMutableDictionary *remoteNotification = [NSMutableDictionary dictionaryWithDictionary:notification.userInfo[@"notification"]];
  RNCRemoteNotificationCallback completionHandler = notification.userInfo[@"completionHandler"];
  NSString *notificationId = [[NSUUID UUID] UUIDString];
  remoteNotification[@"notificationId"] = notificationId;
  remoteNotification[@"remote"] = @YES;
  if (completionHandler) {
    if (!self.remoteNotificationCallbacks) {
      // Lazy initialization
      self.remoteNotificationCallbacks = [NSMutableDictionary dictionary];
    }
    self.remoteNotificationCallbacks[notificationId] = completionHandler;
  }
  
  [self sendEventWithName:@"remoteNotificationReceived" body:remoteNotification];
}

- (void)handleRemoteNotificationsRegistered:(NSNotification *)notification
{
  [self sendEventWithName:@"remoteNotificationsRegistered" body:notification.userInfo];
}

- (void)handleRemoteNotificationRegistrationError:(NSNotification *)notification
{
  NSError *error = notification.userInfo[@"error"];
  NSDictionary *errorDetails = @{
    @"message": error.localizedDescription,
    @"code": @(error.code),
    @"details": error.userInfo,
  };
  [self sendEventWithName:@"remoteNotificationRegistrationError" body:errorDetails];
}

RCT_EXPORT_METHOD(onFinishRemoteNotification:(NSString *)notificationId fetchResult:(UIBackgroundFetchResult)result)
{
  [self.remoteNotificationCallbacks removeObjectForKey:notificationId];
}

/**
 * Update the application icon badge number on the home screen
 */
RCT_EXPORT_METHOD(setApplicationIconBadgeNumber:(NSInteger)number)
{
  RCTSharedApplication().applicationIconBadgeNumber = number;
}

/**
 * Get the current application icon badge number on the home screen
 */
RCT_EXPORT_METHOD(getApplicationIconBadgeNumber:(RCTResponseSenderBlock)callback)
{
  callback(@[@(RCTSharedApplication().applicationIconBadgeNumber)]);
}

RCT_EXPORT_METHOD(requestPermissions:(NSDictionary *)permissions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (RCTRunningInAppExtension()) {
    reject(kErrorUnableToRequestPermissions, nil, RCTErrorWithMessage(@"Requesting push notifications is currently unavailable in an app extension"));
    return;
  }
    
  // Add a listener to make sure that startObserving has been called
  [self addListener:@"remoteNotificationsRegistered"];
  
  UNAuthorizationOptions types = UNAuthorizationOptionNone;
  if (permissions) {
    if ([RCTConvert BOOL:permissions[@"alert"]]) {
      types |= UNAuthorizationOptionAlert;
    }
    if ([RCTConvert BOOL:permissions[@"badge"]]) {
      types |= UNAuthorizationOptionBadge;
    }
    if ([RCTConvert BOOL:permissions[@"sound"]]) {
      types |= UNAuthorizationOptionSound;
    }
    if (@available(iOS 12, *)) {
        if ([RCTConvert BOOL:permissions[@"critical"]]) {
            types |= UNAuthorizationOptionCriticalAlert;
        }
    }
  } else {
    types = UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound;
  }
  
  [UNUserNotificationCenter.currentNotificationCenter
    requestAuthorizationWithOptions:types
    completionHandler:^(BOOL granted, NSError *_Nullable error) {

    if (error != NULL) {
      reject(@"-1", @"Error - Push authorization request failed.", error);
    } else {
      dispatch_async(dispatch_get_main_queue(), ^(void){
        [RCTSharedApplication() registerForRemoteNotifications];
      });
      [UNUserNotificationCenter.currentNotificationCenter getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
        resolve(RCTPromiseResolveValueForUNNotificationSettings(settings));
      }];
    }
  }];
}

RCT_EXPORT_METHOD(abandonPermissions)
{
  [RCTSharedApplication() unregisterForRemoteNotifications];
}

RCT_EXPORT_METHOD(checkPermissions:(RCTResponseSenderBlock)callback)
{
  if (RCTRunningInAppExtension()) {
    callback(@[RCTSettingsDictForUNNotificationSettings(NO, NO, NO, NO, NO, NO, UNAuthorizationStatusNotDetermined)]);
    return;
  }
  
  [UNUserNotificationCenter.currentNotificationCenter getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
    callback(@[RCTPromiseResolveValueForUNNotificationSettings(settings)]);
    }];
  }

static inline NSDictionary *RCTPromiseResolveValueForUNNotificationSettings(UNNotificationSettings* _Nonnull settings) {
  return RCTSettingsDictForUNNotificationSettings(settings.alertSetting == UNNotificationSettingEnabled,
                                                  settings.badgeSetting == UNNotificationSettingEnabled,
                                                  settings.soundSetting == UNNotificationSettingEnabled,
                                                  @available(iOS 12, *) && settings.criticalAlertSetting == UNNotificationSettingEnabled,
                                                  settings.lockScreenSetting == UNNotificationSettingEnabled,
                                                  settings.notificationCenterSetting == UNNotificationSettingEnabled,
                                                  settings.authorizationStatus);
  }

static inline NSDictionary *RCTSettingsDictForUNNotificationSettings(BOOL alert, BOOL badge, BOOL sound, BOOL critical, BOOL lockScreen, BOOL notificationCenter, UNAuthorizationStatus authorizationStatus) {
  return @{@"alert": @(alert), @"badge": @(badge), @"sound": @(sound), @"critical": @(critical), @"lockScreen": @(lockScreen), @"notificationCenter": @(notificationCenter), @"authorizationStatus": @(authorizationStatus)};
  }

/**
 * Method deprecated in iOS 10.0
 * TODO: This method will be removed in the next major version
 */
RCT_EXPORT_METHOD(presentLocalNotification:(UILocalNotification *)notification)
{
  [RCTSharedApplication() presentLocalNotificationNow:notification];
}

/**
 * Method deprecated in iOS 10.0
 * TODO: This method will be removed in the next major version
 */
RCT_EXPORT_METHOD(scheduleLocalNotification:(UILocalNotification *)notification)
{
  [RCTSharedApplication() scheduleLocalNotification:notification];
}

RCT_EXPORT_METHOD(addNotificationRequest:(UNNotificationRequest*)request)
{
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    NSString *imageUrl = request.content.userInfo[@"image"];
    NSMutableDictionary *fcmInfo = request.content.userInfo[@"fcm_options"];
    if(fcmInfo != nil && fcmInfo[@"image"] != nil) {
        imageUrl = fcmInfo[@"image"];
    }
    if(imageUrl != nil) {
        NSURL *attachmentURL = [NSURL URLWithString:imageUrl];
        [self loadAttachmentForUrl:attachmentURL completionHandler:^(UNNotificationAttachment *attachment) {
            if (attachment) {
                UNMutableNotificationContent *bestAttemptRequest = [request.content mutableCopy];
                [bestAttemptRequest setAttachments: [NSArray arrayWithObject:attachment]];
                UNNotificationRequest* notification = [UNNotificationRequest requestWithIdentifier:request.identifier content:bestAttemptRequest trigger:request.trigger];
                [center addNotificationRequest:notification
                            withCompletionHandler:^(NSError* _Nullable error) {
                    if (!error) {
                        NSLog(@"image notifier request success");
                        }
                    }
                ];
            }
        }];
    } else {
        [center addNotificationRequest:request
                 withCompletionHandler:^(NSError* _Nullable error) {
            if (!error) {
                NSLog(@"notifier request success");
                }
            }
        ];
    }
    
}

- (void)loadAttachmentForUrl:(NSURL *)attachmentURL
           completionHandler:(void (^)(UNNotificationAttachment *))completionHandler {
  __block UNNotificationAttachment *attachment = nil;

  NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];

  [[session
      downloadTaskWithURL:attachmentURL
        completionHandler:^(NSURL *temporaryFileLocation, NSURLResponse *response, NSError *error) {
          if (error != nil) {
            NSLog( @"Failed to download image given URL %@, error: %@\n", attachmentURL, error);
            completionHandler(attachment);
            return;
          }

          NSFileManager *fileManager = [NSFileManager defaultManager];
          NSString *fileExtension =
              [NSString stringWithFormat:@".%@", [response.suggestedFilename pathExtension]];
          NSURL *localURL = [NSURL
              fileURLWithPath:[temporaryFileLocation.path stringByAppendingString:fileExtension]];
          [fileManager moveItemAtURL:temporaryFileLocation toURL:localURL error:&error];
          if (error) {
            NSLog( @"Failed to move the image file to local location: %@, error: %@\n", localURL, error);
            completionHandler(attachment);
            return;
          }

          attachment = [UNNotificationAttachment attachmentWithIdentifier:@""
                                                                      URL:localURL
                                                                  options:nil
                                                                    error:&error];
          if (error) {
              NSLog(@"Failed to create attachment with URL %@, error: %@\n", localURL, error);
            completionHandler(attachment);
            return;
          }
          completionHandler(attachment);
        }] resume];
}

RCT_EXPORT_METHOD(setNotificationCategories:(NSArray*)categories)
{
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    NSMutableSet<UNNotificationCategory *>* categorySet = nil;
    
    if ([categories count] > 0) {
        categorySet = [NSMutableSet new];
        for(NSDictionary* category in categories){
            [categorySet addObject:[RCTConvert UNNotificationCategory:category]];
        }
    }
    [center setNotificationCategories:categorySet];
}

/**
 * Method not Available in iOS11+
 * TODO: This method will be removed in the next major version
 */
RCT_EXPORT_METHOD(cancelAllLocalNotifications)
{
  [RCTSharedApplication() cancelAllLocalNotifications];
}

RCT_EXPORT_METHOD(removeAllPendingNotificationRequests)
{
    if ([UNUserNotificationCenter class]) {
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        [center removeAllPendingNotificationRequests];
    }
}

RCT_EXPORT_METHOD(removePendingNotificationRequests:(NSArray<NSString *> *)identifiers)
{
    if ([UNUserNotificationCenter class]) {
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        [center removePendingNotificationRequestsWithIdentifiers:identifiers];
    }
}

/**
 * Method deprecated in iOS 10.0
 * TODO: This method will be removed in the next major version
 */
RCT_EXPORT_METHOD(cancelLocalNotifications:(NSDictionary<NSString *, id> *)userInfo)
{
  for (UILocalNotification *notification in RCTSharedApplication().scheduledLocalNotifications) {
    __block BOOL matchesAll = YES;
    NSDictionary<NSString *, id> *notificationInfo = notification.userInfo;
    // Note: we do this with a loop instead of just `isEqualToDictionary:`
    // because we only require that all specified userInfo values match the
    // notificationInfo values - notificationInfo may contain additional values
    // which we don't care about.
    [userInfo enumerateKeysAndObjectsUsingBlock:^(NSString *key, id obj, BOOL *stop) {
      if (![notificationInfo[key] isEqual:obj]) {
        matchesAll = NO;
        *stop = YES;
      }
    }];
    if (matchesAll) {
      [RCTSharedApplication() cancelLocalNotification:notification];
    }
  }
}


RCT_EXPORT_METHOD(getInitialNotification:(RCTPromiseResolveBlock)resolve
                  reject:(__unused RCTPromiseRejectBlock)reject)
{
    NSMutableDictionary<NSString *, id> *initialNotification =
    [self.bridge.launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey] mutableCopy];
    UILocalNotification *initialLocalNotification =
    self.bridge.launchOptions[UIApplicationLaunchOptionsLocalNotificationKey];
  
    if (initialNotification) {
      initialNotification[@"userInteraction"] = [NSNumber numberWithInt:1];
      initialNotification[@"remote"] = @YES;
      resolve(initialNotification);
    } else if (initialLocalNotification) {
      resolve([RCTConvert RCTFormatLocalNotification:initialLocalNotification]);
    } else {
      resolve((id)kCFNull);
    }
}

/**
 * Method deprecated in iOS 10.0
 * TODO: This method will be removed in the next major version
 */
RCT_EXPORT_METHOD(getScheduledLocalNotifications:(RCTResponseSenderBlock)callback)
{
  NSArray<UILocalNotification *> *scheduledLocalNotifications = RCTSharedApplication().scheduledLocalNotifications;
  NSMutableArray<NSDictionary *> *formattedScheduledLocalNotifications = [NSMutableArray new];
  for (UILocalNotification *notification in scheduledLocalNotifications) {
      [formattedScheduledLocalNotifications addObject:[RCTConvert RCTFormatLocalNotification:notification]];
  }
  callback(@[formattedScheduledLocalNotifications]);
}

RCT_EXPORT_METHOD(getPendingNotificationRequests: (RCTResponseSenderBlock)callback)
{
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> *_Nonnull requests) {
      NSMutableArray<NSDictionary *> *formattedRequests = [NSMutableArray new];
      
      for (UNNotificationRequest *request in requests) {
          [formattedRequests addObject:[RCTConvert RCTFormatUNNotificationRequest:request]];
      }
      callback(@[formattedRequests]);
    }];
}

RCT_EXPORT_METHOD(removeAllDeliveredNotifications)
{
  if ([UNUserNotificationCenter class]) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center removeAllDeliveredNotifications];
  }
}

RCT_EXPORT_METHOD(removeDeliveredNotifications:(NSArray<NSString *> *)identifiers)
{
  if ([UNUserNotificationCenter class]) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center removeDeliveredNotificationsWithIdentifiers:identifiers];
  }
}

RCT_EXPORT_METHOD(getDeliveredNotifications:(RCTResponseSenderBlock)callback)
{
  if ([UNUserNotificationCenter class]) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> *_Nonnull notifications) {
      NSMutableArray<NSDictionary *> *formattedNotifications = [NSMutableArray new];
      
      for (UNNotification *notification in notifications) {
          [formattedNotifications addObject:[RCTConvert RCTFormatUNNotification:notification]];
      }
      callback(@[formattedNotifications]);
    }];
  }
}

#else //TARGET_OS_TV

RCT_EXPORT_METHOD(onFinishRemoteNotification:(NSString *)notificationId fetchResult:(NSString *)fetchResult)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(setApplicationIconBadgeNumber:(double)number)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getApplicationIconBadgeNumber:(RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(requestPermissions:(JS::NativePushNotificationManagerIOS::SpecRequestPermissionsPermission &)permissions
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(abandonPermissions)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(checkPermissions:(RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(presentLocalNotification:(JS::NativePushNotificationManagerIOS::Notification &)notification)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(scheduleLocalNotification:(JS::NativePushNotificationManagerIOS::Notification &)notification)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(cancelAllLocalNotifications)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(cancelLocalNotifications:(NSDictionary<NSString *, id> *)userInfo)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getInitialNotification:(RCTPromiseResolveBlock)resolve
                  reject:(__unused RCTPromiseRejectBlock)reject)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getScheduledLocalNotifications:(RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(removeAllDeliveredNotifications)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(removeDeliveredNotifications:(NSArray<NSString *> *)identifiers)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getDeliveredNotifications:(RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}


- (NSArray<NSString *> *)supportedEvents
{
  return @[];
}

#endif //TARGET_OS_TV

@end
