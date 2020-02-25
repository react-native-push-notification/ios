# @react-native-community/push-notification-ios

[![Build Status][build-badge]][build]
[![Version][version-badge]][package]
[![MIT License][license-badge]][license]
[![Lean Core Badge][lean-core-badge]][lean-core-issue]

React Native Push Notification API for iOS.

## Getting started

### Install

```bash
yarn add @react-native-community/push-notification-ios
```

### Link

There are a couple of cases for linking. Choose the appropriate one.

- `react-native >= 0.60`

 The package is [automatically linked](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md) when building the app. All you need to do is:

```bash
cd ios && pod install
```

- `react-native <= 0.59`

```bash
react-native link @react-native-community/push-notification-ios
```

- upgrading to `react-native >= 0.60`

 First, unlink the library. Then follow the instructions above.

 ```bash
 react-native unlink @react-native-community/push-notification-ios
 ```

- manual linking

 If you don't want to use the methods above, you can always [link the library manually](./docs/manual-linking.md).

### Update `AppDelegate.m`

Finally, to enable support for `notification` and `register` events you need to augment your AppDelegate.

At the top of the file:

```objective-c
#import <RNCPushNotificationIOS.h>
```

Then, add the following lines:

```objective-c
// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}
```

Also, if not already present, at the top of the file:

```objective-c
#import <UserNotifications/UserNotifications.h>
```

Inside didFinishLaunchingWithOptions or equivalent:

```objective-c
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
```

And at the bottom (before @end):

```objective-c
  // Called when a notification is delivered to a foreground app.
  -(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
  {
    completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge);
  }
```

## Migrating from the core `react-native` module

This module was created when the PushNotificationIOS was split out from the core of React Native. To migrate to this module you need to follow the installation instructions above and then change you imports from:

```js
import { PushNotificationIOS } from "react-native";
```

to:

```js
import PushNotificationIOS from "@react-native-community/push-notification-ios";
```

[build-badge]: https://img.shields.io/circleci/project/github/react-native-community/react-native-push-notification-ios/master.svg?style=flat-square
[build]: https://circleci.com/gh/react-native-community/react-native-push-notification-ios
[version-badge]: https://img.shields.io/npm/v/@react-native-community/push-notification-ios.svg?style=flat-square
[package]: https://www.npmjs.com/package/@react-native-community/push-notification-ios
[license-badge]: https://img.shields.io/npm/l/@react-native-community/push-notification-ios.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT
[lean-core-badge]: https://img.shields.io/badge/Lean%20Core-Extracted-brightgreen.svg?style=flat-square
[lean-core-issue]: https://github.com/facebook/react-native/issues/23313
