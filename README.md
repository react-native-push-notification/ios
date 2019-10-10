# @react-native-community/push-notification-ios

React Native Push Notifications API for iOS.

## Getting started

### Install

```
yarn add @react-native-community/push-notification-ios
```

### Link
There are a couple of cases for linking. Choose the appropriate one.
- `react-native >= 0.60`

 The package is [automatically linked](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md) when building the app. All you need to do is:
```
cd ios && pod install
```

- `react-native <= 0.59`
```
react-native link @react-native-community/async-storage
```

- upgrading to `react-native >= 0.60`

 First, unlink the library. Then follow the instructions above.
 ```
 react-native unlink @react-native-community/push-notification-ios
 ```

- manual linking

 If you don't want to use the methods above, you can always [link the library manually](./docs/manual-linking.md).

### Update `AppDelegate.m`

Finally, to enable support for `notification` and `register` events you need to augment your AppDelegate.

At the top of the file:
```
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

## Migrating from the core `react-native` module
This module was created when the PushNotificationIOS was split out from the core of React Native. To migrate to this module you need to follow the installation instructions above and then change you imports from:

```js
import { PushNotificationIOS } from "react-native";
```

to:

```js
import PushNotificationIOS from "@react-native-community/push-notification-ios";
```
