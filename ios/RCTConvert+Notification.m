//
//  RCTConvert+.m
//  RNCPushNotificationIOS
//
//  Created by Jesse Katsumata on 2020/11/25.
//

#import "RCTConvert+Notification.h"

@implementation RCTConvert (NSCalendarUnit)

RCT_ENUM_CONVERTER(NSCalendarUnit,
                   (@{
                      @"year": @(NSCalendarUnitYear),
                      @"month": @(NSCalendarUnitMonth),
                      @"week": @(NSCalendarUnitWeekOfYear),
                      @"day": @(NSCalendarUnitDay),
                      @"hour": @(NSCalendarUnitHour),
                      @"minute": @(NSCalendarUnitMinute)
                      }),
                   0,
                   integerValue)

@end


@implementation RCTConvert (UNNotificationInterruptionLevel)

RCT_ENUM_CONVERTER(UNNotificationInterruptionLevel,
                   (@{
                      @"passive": @(UNNotificationInterruptionLevelPassive),
                      @"active": @(UNNotificationInterruptionLevelActive),
                      @"timeSensitive": @(UNNotificationInterruptionLevelTimeSensitive),
                      @"critical": @(UNNotificationInterruptionLevelCritical)
                      }),
                   0,
                   integerValue)

@end


/**
 * Type deprecated in iOS 10.0
 * TODO: This method will be removed in the next major version
 */
@implementation RCTConvert (UILocalNotification)

+ (UILocalNotification *)UILocalNotification:(id)json
{
    NSDictionary<NSString *, id> *details = [self NSDictionary:json];
    BOOL isSilent = [RCTConvert BOOL:details[@"isSilent"]];
    BOOL isTimeZoneAgnostic = [RCTConvert BOOL:details[@"isTimeZoneAgnostic"]];
    UILocalNotification *notification = [UILocalNotification new];
    notification.alertTitle = [RCTConvert NSString:details[@"alertTitle"]];
    notification.fireDate = [RCTConvert NSDate:details[@"fireDate"]] ?: [NSDate date];
    notification.alertBody = [RCTConvert NSString:details[@"alertBody"]];
    notification.alertAction = [RCTConvert NSString:details[@"alertAction"]];
    notification.userInfo = [RCTConvert NSDictionary:details[@"userInfo"]];
    notification.category = [RCTConvert NSString:details[@"category"]];
    notification.repeatInterval = [RCTConvert NSCalendarUnit:details[@"repeatInterval"]];
    if (details[@"applicationIconBadgeNumber"]) {
        notification.applicationIconBadgeNumber = [RCTConvert NSInteger:details[@"applicationIconBadgeNumber"]];
    }
    if (!isSilent) {
        notification.soundName = [RCTConvert NSString:details[@"soundName"]] ?: UILocalNotificationDefaultSoundName;
    }
    if (isTimeZoneAgnostic) {
        notification.timeZone = [NSTimeZone defaultTimeZone];
    }
    return notification;
}

RCT_ENUM_CONVERTER(UIBackgroundFetchResult, (@{
  @"UIBackgroundFetchResultNewData": @(UIBackgroundFetchResultNewData),
  @"UIBackgroundFetchResultNoData": @(UIBackgroundFetchResultNoData),
  @"UIBackgroundFetchResultFailed": @(UIBackgroundFetchResultFailed),
}), UIBackgroundFetchResultNoData, integerValue)


+ (NSDictionary *)RCTFormatLocalNotification:(UILocalNotification *)notification
{
    NSMutableDictionary *formattedLocalNotification = [NSMutableDictionary dictionary];
  
    if (notification.fireDate) {
        NSDateFormatter *formatter = [NSDateFormatter new];
        [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"];
        NSString *fireDateString = [formatter stringFromDate:notification.fireDate];
        formattedLocalNotification[@"fireDate"] = fireDateString;
    }
  
    formattedLocalNotification[@"alertAction"] = RCTNullIfNil(notification.alertAction);
    formattedLocalNotification[@"alertTitle"] = RCTNullIfNil(notification.alertTitle);
    formattedLocalNotification[@"alertBody"] = RCTNullIfNil(notification.alertBody);
    formattedLocalNotification[@"applicationIconBadgeNumber"] = @(notification.applicationIconBadgeNumber);
    formattedLocalNotification[@"category"] = RCTNullIfNil(notification.category);
    formattedLocalNotification[@"repeatInterval"] = @(notification.repeatInterval);
    formattedLocalNotification[@"soundName"] = RCTNullIfNil(notification.soundName);
    formattedLocalNotification[@"userInfo"] = RCTNullIfNil(RCTJSONClean(notification.userInfo));
    formattedLocalNotification[@"remote"] = @NO;

    return formattedLocalNotification;
}

@end

/**
 * Convert json to UNNotificationRequest
 */
@implementation RCTConvert (UNNotificationRequest)

+ (UNNotificationRequest *)UNNotificationRequest:(id)json
{
    NSDictionary<NSString *, id> *details = [self NSDictionary:json];

    BOOL isSilent = [RCTConvert BOOL:details[@"isSilent"]];
    BOOL isCritical = [RCTConvert BOOL:details[@"isCritical"]];
    float criticalSoundVolume = [RCTConvert float:details[@"criticalSoundVolume"]];
    NSString* identifier = [RCTConvert NSString:details[@"id"]];

    UNMutableNotificationContent* content = [[UNMutableNotificationContent alloc] init];
    content.title              = [RCTConvert NSString:details[@"title"]];
    content.subtitle           = [RCTConvert NSString:details[@"subtitle"]];
    content.body               = [RCTConvert NSString:details[@"body"]];
    content.badge              = [RCTConvert NSNumber:details[@"badge"]];
    content.categoryIdentifier = [RCTConvert NSString:details[@"category"]];

    if (@available(iOS 15.0, *)) {
        UNNotificationInterruptionLevel interruptionLevel =[RCTConvert UNNotificationInterruptionLevel:details[@"interruptionLevel"]];
        if(interruptionLevel) {
        content.interruptionLevel = interruptionLevel;
        }
    }

    NSString* threadIdentifier = [RCTConvert NSString:details[@"threadId"]];
    if (threadIdentifier){
        content.threadIdentifier = threadIdentifier;
    }

    NSDictionary<NSString *, id> *userDateComps = [RCTConvert NSDictionary:details[@"repeatsComponent"]];
    BOOL year       = [RCTConvert BOOL:userDateComps[@"year"]];
    BOOL month      = [RCTConvert BOOL:userDateComps[@"month"]];
    BOOL day        = [RCTConvert BOOL:userDateComps[@"day"]];
    BOOL dayOfWeek  = [RCTConvert BOOL:userDateComps[@"dayOfWeek"]];
    BOOL hour       = [RCTConvert BOOL:userDateComps[@"hour"]];
    BOOL minute     = [RCTConvert BOOL:userDateComps[@"minute"]];
    BOOL second     = [RCTConvert BOOL:userDateComps[@"second"]];

    content.userInfo = [RCTConvert NSDictionary:details[@"userInfo"]];
    if (!isSilent) {
        if (isCritical) {
            if (criticalSoundVolume) {
                content.sound = [RCTConvert NSString:details[@"sound"]] ? [UNNotificationSound criticalSoundNamed:[RCTConvert NSString:details[@"sound"]] withAudioVolume:criticalSoundVolume] : [UNNotificationSound defaultCriticalSoundWithAudioVolume:criticalSoundVolume];
            } else {
                content.sound = [RCTConvert NSString:details[@"sound"]] ? [UNNotificationSound criticalSoundNamed:[RCTConvert NSString:details[@"sound"]]] : [UNNotificationSound defaultCriticalSound];
            }
        } else {
            content.sound = [RCTConvert NSString:details[@"sound"]] ? [UNNotificationSound soundNamed:[RCTConvert NSString:details[@"sound"]]] : [UNNotificationSound defaultSound];
        }
    }

    NSDate* fireDate = [RCTConvert NSDate:details[@"fireDate"]];
    BOOL repeats = [RCTConvert BOOL:details[@"repeats"]];
    NSCalendarUnit defaultDateComponents =
        NSCalendarUnitYear |
        NSCalendarUnitMonth |
        NSCalendarUnitDay |
        NSCalendarUnitHour |
        NSCalendarUnitMinute |
        NSCalendarUnitSecond;
    NSCalendarUnit repeatDateComponents =
        (year ? NSCalendarUnitYear : 0) |
        (month ? NSCalendarUnitMonth : 0) |
        (day ? NSCalendarUnitDay : 0) |
        (dayOfWeek ? NSCalendarUnitWeekday : 0) |
        (hour ? NSCalendarUnitHour : 0) |
        (minute ? NSCalendarUnitMinute : 0) |
        (second ? NSCalendarUnitSecond : 0);
    NSDateComponents *triggerDate = fireDate
        ? [[NSCalendar currentCalendar]
           components:(repeats ? repeatDateComponents : defaultDateComponents) | NSCalendarUnitTimeZone
           fromDate:fireDate]
        : nil;

    UNCalendarNotificationTrigger* trigger = triggerDate ? [UNCalendarNotificationTrigger triggerWithDateMatchingComponents:triggerDate repeats:repeats] : nil;

    UNNotificationRequest* notification = [UNNotificationRequest requestWithIdentifier:identifier content:content trigger:trigger];
    return notification;
}

/**
 * Pass UNNotificationRequest to JS as a json object
 */
+ (NSDictionary *)RCTFormatUNNotificationRequest:(UNNotificationRequest*)request
{
    NSMutableDictionary *formattedRequest = [NSMutableDictionary dictionary];
    
    formattedRequest[@"id"] = RCTNullIfNil(request.identifier);
    
    UNNotificationContent *content = request.content;
    formattedRequest[@"title"] = RCTNullIfNil(content.title);
    formattedRequest[@"subtitle"] = RCTNullIfNil(content.subtitle);
    formattedRequest[@"body"] = RCTNullIfNil(content.body);
    formattedRequest[@"badge"] = RCTNullIfNil(content.badge);
    formattedRequest[@"sound"] = RCTNullIfNil(content.sound);
    formattedRequest[@"category"] = RCTNullIfNil(content.categoryIdentifier);
    formattedRequest[@"thread-id"] = RCTNullIfNil(content.threadIdentifier);
    formattedRequest[@"userInfo"] = RCTNullIfNil(RCTJSONClean(content.userInfo));
    
    if (request.trigger) {
        UNCalendarNotificationTrigger* trigger = (UNCalendarNotificationTrigger*)request.trigger;
        NSDateFormatter *formatter = [NSDateFormatter new];
        [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"];
        NSString *dateString = [formatter stringFromDate:trigger.nextTriggerDate];
        formattedRequest[@"date"] = dateString;
    }

    return formattedRequest;
}

@end

/**
 * Convert json to UNNotificationActionOptions
 */
@implementation RCTConvert (UNNotificationActionOptions)

+ (UNNotificationActionOptions)UNNotificationActionOptions:(id)json
{
    NSDictionary<NSString *, id> *details = [self NSDictionary:json];
    UNNotificationActionOptions options = UNNotificationActionOptionNone;
    if ([RCTConvert BOOL:details[@"foreground"]]==TRUE) {
        options |= UNNotificationActionOptionForeground;
    }
    if ([RCTConvert BOOL:details[@"destructive"]]==TRUE) {
        options |= UNNotificationActionOptionDestructive;
    }
    if ([RCTConvert BOOL:details[@"authenticationRequired"]]==TRUE) {
        options |= UNNotificationActionOptionAuthenticationRequired;
    }
    return options;
}

@end

/**
 * Convert json to UNNotificationAction
 */
@implementation RCTConvert (UNNotificationAction)

+ (UNNotificationAction *)UNNotificationAction:(id)json
{
    NSDictionary<NSString *, id> *details = [self NSDictionary:json];
    NSString* identifier = [RCTConvert NSString:details[@"id"]];
    NSString* title = [RCTConvert NSString:details[@"title"]];
    
    
    UNNotificationActionOptions options = [RCTConvert UNNotificationActionOptions:details[@"options"]];
    UNNotificationAction* action = details[@"textInput"] ? [UNTextInputNotificationAction actionWithIdentifier:identifier title:title options:options textInputButtonTitle:details[@"textInput"][@"buttonTitle"] textInputPlaceholder:details[@"textInput"][@"placeholder"]] : [UNNotificationAction actionWithIdentifier:identifier title:title options:options];
    
    return action;
}

@end

/**
 * Convert json to UNNotificationCategory
 */
@implementation RCTConvert (UNNotificationCategory)

+ (UNNotificationCategory *)UNNotificationCategory:(id)json
{
    NSDictionary<NSString *, id> *details = [self NSDictionary:json];
    
    NSString* identifier = [RCTConvert NSString:details[@"id"]];
    NSMutableArray* actions = [NSMutableArray new];
        for (NSDictionary* action in [RCTConvert NSArray:details[@"actions"]]) {
            [actions addObject:[RCTConvert UNNotificationAction:action]];
        }
    
    UNNotificationCategory* category = [UNNotificationCategory categoryWithIdentifier:identifier actions:actions intentIdentifiers:@[] options:UNNotificationCategoryOptionNone];
    
    return category;
}

@end


/**
 * Pass UNNotificationResponse to JS as a json object
 */
@implementation RCTConvert (UNNotificationResponse)
+ (NSDictionary *)RCTFormatUNNotificationResponse:(UNNotificationResponse *)response
{
    UNNotification* notification = response.notification;
    NSMutableDictionary *formattedResponse = [[RCTConvert RCTFormatUNNotification:notification] mutableCopy];
    UNNotificationContent *content = notification.request.content;
      
    NSMutableDictionary *userInfo = [content.userInfo mutableCopy];
    userInfo[@"userInteraction"] = [NSNumber numberWithInt:1];
    userInfo[@"actionIdentifier"] = response.actionIdentifier;
    
    formattedResponse[@"badge"] = RCTNullIfNil(content.badge);
    formattedResponse[@"sound"] = RCTNullIfNil(content.sound);
    formattedResponse[@"userInfo"] = RCTNullIfNil(RCTJSONClean(userInfo));
    formattedResponse[@"actionIdentifier"] = RCTNullIfNil(response.actionIdentifier);
      
    NSString* userText = [response isKindOfClass:[UNTextInputNotificationResponse class]] ? ((UNTextInputNotificationResponse *)response).userText : nil;
    if (userText) {
      formattedResponse[@"userText"] = RCTNullIfNil(userText);
    }
      
    return formattedResponse;
}
@end

/**
 * Pass UNNotification to JS as a json object
 */
@implementation RCTConvert (UNNotification)

+ (NSDictionary *)RCTFormatUNNotification:(UNNotification *)notification
{
    NSMutableDictionary *formattedNotification = [NSMutableDictionary dictionary];
    UNNotificationContent *content = notification.request.content;
  
    formattedNotification[@"identifier"] = notification.request.identifier;
  
    if (notification.date) {
      NSDateFormatter *formatter = [NSDateFormatter new];
      [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"];
      NSString *dateString = [formatter stringFromDate:notification.date];
      formattedNotification[@"date"] = dateString;
    }
  
    formattedNotification[@"title"] = RCTNullIfNil(content.title);
    formattedNotification[@"subtitle"] = RCTNullIfNil(content.subtitle);
    formattedNotification[@"body"] = RCTNullIfNil(content.body);
    formattedNotification[@"badge"] = RCTNullIfNil(content.badge);
    formattedNotification[@"sound"] = RCTNullIfNil(content.sound);
    formattedNotification[@"category"] = RCTNullIfNil(content.categoryIdentifier);
    formattedNotification[@"thread-id"] = RCTNullIfNil(content.threadIdentifier);
    formattedNotification[@"userInfo"] = RCTNullIfNil(RCTJSONClean(content.userInfo));
  
    return formattedNotification;
}

@end

