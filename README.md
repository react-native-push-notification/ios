# `@react-native-community/push-notification-ios`

React Native Push Notification API for iOS.

## Getting started
Install the library using either Yarn:

```
yarn add @react-native-community/push-notification-ios
```

or npm:

```
npm install --save @react-native-community/push-notification-ios
```

You then need to link the native parts of the library for the platforms you are using. The easiest way to link the library is using the CLI tool by running this command from the root of your project:

```
react-native link @react-native-community/push-notification-ios
```

<details>
<summary>Manually link the library</summary>
   
- Add the following to your Project: `node_modules/@react-native-community/push-notification-ios/ios/PushNotificationIOS.xcodeproj`
- Add the following to Link Binary With Libraries: `libRNCPushNotificationIOS.a`
</details>

Finally, to enable support for `notification` and `register` events you need to augment your AppDelegate.

#### `AppDelegate.m`

- `#import <RNCPushNotificationIOS.h>`

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

```javascript
import { PushNotificationIOS } from "react-native";
```

to:

```javascript
import PushNotificationIOS from "@react-native-community/push-notification-ios";
```
