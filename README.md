# @react-native-community/push-notification-ios

[![Build Status][build-badge]][build]
[![Version][version-badge]][package]
[![MIT License][license-badge]][license]
[![Lean Core Badge][lean-core-badge]][lean-core-issue]

React Native Push Notification API for iOS.

| Notification                                                                                                                  | With Action                                                                                                                   | With TextInput Action                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/6936373/97115527-77c6ee80-173a-11eb-8440-049590a25f31.jpeg" width="320"/> | <img src="https://user-images.githubusercontent.com/6936373/97115526-772e5800-173a-11eb-8b51-c5263bced07a.jpeg" width="320"/> | <img src="https://user-images.githubusercontent.com/6936373/97115522-74cbfe00-173a-11eb-9644-fc1d5e634d6b.jpeg" width="320"/> |

## Getting started

### Install

Using npm:

```bash
npm i @react-native-community/push-notification-ios --save
```

or using Yarn:

```bash
yarn add @react-native-community/push-notification-ios
```

## Link

### React Native v0.60+

The package is [automatically linked](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md) when building the app. All you need to do is:

```bash
npx pod-install
```

For android, the package will be linked automatically on build.

<details>
 <summary>For React Native version 0.59 or older</summary>

### React Native <= v0.59

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

</details>

### Add Capabilities : Background Mode - Remote Notifications

Go into your MyReactProject/ios dir and open MyProject.xcworkspace workspace.
Select the top project "MyProject" and select the "Signing & Capabilities" tab.
Add a 2 new Capabilities using "+" button:

- `Background Mode` capability and tick `Remote Notifications`.
- `Push Notifications` capability

### Augment `AppDelegate`

Finally, to enable support for `notification` and `register` events you need to augment your AppDelegate.

### Update `AppDelegate.h`

At the top of the file:

```objective-c
#import <UserNotifications/UNUserNotificationCenter.h>
```

Then, add the 'UNUserNotificationCenterDelegate' to protocols:

```objective-c
@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>
```

### Update `AppDelegate.m`

At the top of the file:

```objective-c
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
```

Then, add the following lines:

```objective-c
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
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}
```

And then in your AppDelegate implementation, add the following:

```objective-c
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  ...
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  return YES;
}

//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}
```

## Migrating from the core `react-native` module

This module was created when the PushNotificationIOS was split out from the core of React Native. To migrate to this module you need to follow the installation instructions above and then change you imports from:

```js
import {PushNotificationIOS} from 'react-native';
```

to:

```js
import PushNotificationIOS from '@react-native-community/push-notification-ios';
```

## How to determine push notification user click

Receiving remote pushes has two common cases: user dismissed notification and user clicked notification. To have separate logic for each case you can use `notification.getData().userInteraction` to determine push notification user click:

```js
export const App = () => {
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    PushNotificationIOS.addEventListener('notification', onRemoteNotification);
  });

  const onRemoteNotification = (notification) => {
    const isClicked = notification.getData().userInteraction === 1;

    if (isClicked) {
      // Navigate user to another screen
    } else {
      // Do something else with push notification
    }
  };
};
```

## How to perform different action based on user selected action.

```js
export const App = () => {
  const [permissions, setPermissions] = useState({});

  /**
   * By calling this function, notification with category `userAction` will have action buttons
   */
  const setNotificationCategories = () => {
    PushNotificationIOS.setNotificationCategories([
      {
        id: 'userAction',
        actions: [
          {id: 'open', title: 'Open', options: {foreground: true}},
          {
            id: 'ignore',
            title: 'Desruptive',
            options: {foreground: true, destructive: true},
          },
          {
            id: 'text',
            title: 'Text Input',
            options: {foreground: true},
            textInput: {buttonTitle: 'Send'},
          },
        ],
      },
    ]);
  };

  useEffect(() => {
    PushNotificationIOS.addEventListener('notification', onRemoteNotification);
  });

  const onRemoteNotification = (notification) => {
    const actionIdentifier = notification.getActionIdentifier();

    if (actionIdentifier === 'open') {
      // Perform action based on open action
    }

    if (actionIdentifier === 'text') {
      // Text that of user input.
      const userText = notification.getUserText();
      // Perform action based on textinput action
    }
  };
};
```
## How to recieve rich notification in remote

Follow these [article](https://firebase.google.com/docs/cloud-messaging/ios/send-image) to create rich notification for your own 

# Reference

## Methods

### `presentLocalNotification()`

```jsx
PushNotificationIOS.presentLocalNotification(details);
```

_Deprecated_ - use `addNotificationRequest` instead.
Schedules the localNotification for immediate presentation.

**Parameters:**

| Name    | Type   | Required | Description |
| ------- | ------ | -------- | ----------- |
| details | object | Yes      | See below.  |

details is an object containing:

- `alertBody` : The message displayed in the notification alert.
- `alertAction` : The "action" displayed beneath an actionable notification. Defaults to "view". Note that Apple no longer shows this in iOS 10 +
- `alertTitle` : The text displayed as the title of the notification alert.
- `soundName` : The sound played when the notification is fired (optional).
- `isSilent` : If true, the notification will appear without sound (optional).
- `category` : The category of this notification, required for actionable notifications (optional).
- `userInfo` : An object containing additional notification data (optional).
- `applicationIconBadgeNumber` The number to display as the app's icon badge. The default value of this property is 0, which means that no badge is displayed (optional).

---

### `scheduleLocalNotification()`

```jsx
PushNotificationIOS.scheduleLocalNotification(details);
```

_Deprecated_ - use `addNotificationRequest` instead.
Schedules the localNotification for future presentation.

**Parameters:**

| Name    | Type   | Required | Description |
| ------- | ------ | -------- | ----------- |
| details | object | Yes      | See below.  |

details is an object containing:

- `fireDate` : The date and time when the system should deliver the notification.
- `alertTitle` : The text displayed as the title of the notification alert.
- `alertBody` : The message displayed in the notification alert.
- `alertAction` : The "action" displayed beneath an actionable notification. Defaults to "view". Note that Apple no longer shows this in iOS 10 +
- `soundName` : The sound played when the notification is fired (optional).
- `isSilent` : If true, the notification will appear without sound (optional).
- `category` : The category of this notification, required for actionable notifications (optional).
- `userInfo` : An object containing additional notification data (optional).
  - `image` : It's useful if you need to diplay rich notification (optional).  
- `applicationIconBadgeNumber` The number to display as the app's icon badge. Setting the number to 0 removes the icon badge (optional).
- `repeatInterval` : The interval to repeat as a string. Possible values: `minute`, `hour`, `day`, `week`, `month`, `year` (optional).

---

### `addNotificationRequest()`

```jsx
PushNotificationIOS.addNotificationRequest(request);
```

Sends notificationRequest to notification center at specified firedate.
Fires immediately if firedate is not set.

**Parameters:**

| Name    | Type   | Required | Description |
| ------- | ------ | -------- | ----------- |
| request | object | Yes      | See below.  |

request is an object containing:

- `id`: Identifier of the notification. Required in order to be able to retrieve specific notification. (required)
- `title`: A short description of the reason for the alert.
- `subtitle`: A secondary description of the reason for the alert.
- `body` : The message displayed in the notification alert.
- `badge` The number to display as the app's icon badge. Setting the number to 0 removes the icon badge.
- `fireDate` : The date and time when the system should deliver the notification.
- `repeats` : Sets notification to repeat. Must be used with fireDate and repeatsComponent.
- `repeatsComponent`: An object indicating which parts of fireDate should be repeated.
- `sound` : The sound played when the notification is fired.
- `category` : The category of this notification, required for actionable notifications.
- `isSilent` : If true, the notification will appear without sound.
- `isCritical` : If true, the notification sound be played even when the device is locked, muted, or has Do Not Disturb enabled.
- `criticalSoundVolume` : A number between 0 and 1 for volume of critical notification. Default volume will be used if not specified.
- `userInfo` : An object containing additional notification data.

request.repeatsComponent is an object containing (each field is optionnal):

- `year`: Will repeat every selected year in your fireDate.
- `month`: Will repeat every selected month in your fireDate.
- `day`: Will repeat every selected day in your fireDate.
- `dayOfWeek`: Will repeat every selected day of the week in your fireDate.
- `hour`: Will repeat every selected hour in your fireDate.
- `minute`: Will repeat every selected minute in your fireDate.
- `second`: Will repeat every selected second in your fireDate.

For example, let’s say you want to have a notification repeating every day at 23:54, starting tomorrow, you will use something like this:

```javascript
const getCorrectDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(23);
  date.setMinutes(54);
  return date;
};

PushNotificationIOS.addNotificationRequest({
  fireDate: getCorrectDate(),
  repeats: true,
  repeatsComponent: {
    hour: true,
    minute: true,
  },
});
```

If you want to repeat every time the clock reach 54 minutes (like 00:54, 01:54, and so on), just switch hour to false. Every field is used to indicate at what time the notification should be repeated, exactly like you could do on iOS.

---

### `setNotificationCategories()`

```jsx
PushNotificationIOS.setNotificationCategories(categories);
```

Sets category for the notification center.
Allows you to add specific actions for notification with specific category.

**Parameters:**

| Name       | Type     | Required | Description |
| ---------- | -------- | -------- | ----------- |
| categories | object[] | Yes      | See below.  |

`category` is an object containing:

- `id`: Identifier of the notification category. Notification with this category will have the specified actions. (required)
- `actions`: An array of notification actions to be attached to the notification of category id.

`action` is an object containing:

- `id`: Identifier of Action. This value will be returned as actionIdentifier when notification is received.
- `title`: Text to be shown on notification action button.
- `options`: Options for notification action.
  - `foreground`: If `true`, action will be displayed on notification.
  - `destructive`: If `true`, action will be displayed as destructive notification.
  - `authenticationRequired`: If `true`, action will only be displayed for authenticated user.
- `textInput`: Option for textInput action. If textInput prop exists, then user action will automatically become a text input action. The text user inputs will be in the userText field of the received notification.
  - `buttonTitle`: Text to be shown on button when user finishes text input. Default is "Send" or its equivalent word in user's language setting.
  - `placeholder`: Placeholder for text input for text input action.

---

### `removePendingNotificationRequests()`

```jsx
PushNotificationIOS.removePendingNotificationRequests(identifiers);
```

Removes the specified pending notifications from Notification Center

**Parameters:**

| Name        | Type  | Required | Description                        |
| ----------- | ----- | -------- | ---------------------------------- |
| identifiers | string[] | Yes      | Array of notification identifiers. |

---

### `removeAllPendingNotificationRequests()`

```jsx
PushNotificationIOS.removeAllPendingNotificationRequests();
```

Removes all pending notification requests in the notification center.

---

### `removeAllDeliveredNotifications()`

```jsx
PushNotificationIOS.removeAllDeliveredNotifications();
```

Remove all delivered notifications from Notification Center

---

### `getDeliveredNotifications()`

```jsx
PushNotificationIOS.getDeliveredNotifications(callback);
```

Provides you with a list of the app’s notifications that are still displayed in Notification Center

**Parameters:**

| Name     | Type     | Required | Description                                                 |
| -------- | -------- | -------- | ----------------------------------------------------------- |
| callback | function | Yes      | Function which receive an array of delivered notifications. |

A delivered notification is an object containing:

- `identifier` : The identifier of this notification.
- `title` : The title of this notification.
- `body` : The body of this notification.
- `category` : The category of this notification (optional).
- `userInfo` : An object containing additional notification data (optional).
- `thread-id` : The thread identifier of this notification, if has one.

---

### `removeDeliveredNotifications()`

```jsx
PushNotificationIOS.removeDeliveredNotifications(identifiers);
```

Removes the specified delivered notifications from Notification Center

**Parameters:**

| Name        | Type  | Required | Description                        |
| ----------- | ----- | -------- | ---------------------------------- |
| identifiers | string[] | Yes      | Array of notification identifiers. |

---

### `setApplicationIconBadgeNumber()`

```jsx
PushNotificationIOS.setApplicationIconBadgeNumber(number);
```

Sets the badge number for the app icon on the home screen

**Parameters:**

| Name   | Type   | Required | Description                    |
| ------ | ------ | -------- | ------------------------------ |
| number | number | Yes      | Badge number for the app icon. |

---

### `getApplicationIconBadgeNumber()`

```jsx
PushNotificationIOS.getApplicationIconBadgeNumber(callback);
```

Gets the current badge number for the app icon on the home screen

**Parameters:**

| Name     | Type     | Required | Description                                              |
| -------- | -------- | -------- | -------------------------------------------------------- |
| callback | function | Yes      | A function that will be passed the current badge number. |

---

### `cancelLocalNotifications()`

```jsx
PushNotificationIOS.cancelLocalNotifications(userInfo);
```

Cancel local notifications.

Optionally restricts the set of canceled notifications to those notifications whose `userInfo` fields match the corresponding fields in the `userInfo` argument.

**Parameters:**

| Name     | Type   | Required | Description |
| -------- | ------ | -------- | ----------- |
| userInfo | object | No       |             |

---

### `getScheduledLocalNotifications()`

```jsx
PushNotificationIOS.getScheduledLocalNotifications(callback);
```

Gets the local notifications that are currently scheduled.

**Parameters:**

| Name     | Type     | Required | Description                                                                        |
| -------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| callback | function | Yes      | A function that will be passed an array of objects describing local notifications. |

---

### `addEventListener()`

```jsx
PushNotificationIOS.addEventListener(type, handler);
```

Attaches a listener to remote or local notification events while the app is running in the foreground or the background.

**Parameters:**

| Name    | Type     | Required | Description |
| ------- | -------- | -------- | ----------- |
| type    | string   | Yes      | Event type. |
| handler | function | Yes      | Listener.   |

Valid events are:

- `notification` : Fired when a remote notification is received. The handler will be invoked with an instance of `PushNotificationIOS`.
- `localNotification` : Fired when a local notification is received. The handler will be invoked with an instance of `PushNotificationIOS`.
- `register`: Fired when the user registers for remote notifications. The handler will be invoked with a hex string representing the deviceToken.
- `registrationError`: Fired when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. The handler will be invoked with {message: string, code: number, details: any}.

---

### `removeEventListener()`

```jsx
PushNotificationIOS.removeEventListener(type);
```

Removes the event listener. Do this in `componentWillUnmount` to prevent memory leaks

**Parameters:**

| Name | Type   | Required | Description |
| ---- | ------ | -------- | ----------- |
| type | string | Yes      | Event type. |

---

### `requestPermissions()`

```jsx
PushNotificationIOS.requestPermissions([permissions]);
```

Requests notification permissions from iOS, prompting the user's dialog box. By default, it will request all notification permissions, but a subset of these can be requested by passing a map of requested permissions. The following permissions are supported:

- `alert`
- `badge`
- `sound`
- `critical`

`critical` requires special entitlement that could be requested here: https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/

If a map is provided to the method, only the permissions with truthy values will be requested.

This method returns a promise that will resolve when the user accepts, rejects, or if the permissions were previously rejected. The promise resolves to the current state of the permission.

**Parameters:**

| Name        | Type  | Required | Description                     |
| ----------- | ----- | -------- | ------------------------------- |
| permissions | array | No       | alert, badge, sound or critical |

---

### `abandonPermissions()`

```jsx
PushNotificationIOS.abandonPermissions();
```

Unregister for all remote notifications received via Apple Push Notification service.

You should call this method in rare circumstances only, such as when a new version of the app removes support for all types of remote notifications. Users can temporarily prevent apps from receiving remote notifications through the Notifications section of the Settings app. Apps unregistered through this method can always re-register.

---

### `checkPermissions()`

```jsx
PushNotificationIOS.checkPermissions(callback);
```

See what push permissions are currently enabled.

**Parameters:**

| Name     | Type     | Required | Description |
| -------- | -------- | -------- | ----------- |
| callback | function | Yes      | See below.  |

`callback` will be invoked with a `permissions` object:

- `alert` :boolean
- `badge` :boolean
- `sound` :boolean
- `critical` :boolean
- `lockScreen` :boolean
- `notificationCenter` :boolean
- `authorizationStatus` :AuthorizationStatus

  For a list of possible values of `authorizationStatus`, see `PushNotificationIOS.AuthorizationStatus`. For their meanings, refer to https://developer.apple.com/documentation/usernotifications/unauthorizationstatus

---

### `getInitialNotification()`

```jsx
PushNotificationIOS.getInitialNotification();
```

This method returns a promise. If the app was launched by a push notification, this promise resolves to an object of type `PushNotificationIOS`. Otherwise, it resolves to `null`.

---

### `constructor()`

```jsx
constructor(nativeNotif);
```

You will never need to instantiate `PushNotificationIOS` yourself. Listening to the `notification` event and invoking `getInitialNotification` is sufficient.

---

### `finish()`

```jsx
finish(fetchResult);
```

This method is available for remote notifications that have been received via: `application:didReceiveRemoteNotification:fetchCompletionHandler:` https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application?language=objc

Call this to execute when the remote notification handling is complete. When calling this block, pass in the fetch result value that best describes the results of your operation. You _must_ call this handler and should do so as soon as possible. For a list of possible values, see `PushNotificationIOS.FetchResult`.

If you do not call this method your background remote notifications could be throttled, to read more about it see the above documentation link.

---

### `getMessage()`

```jsx
getMessage();
```

An alias for `getAlert` to get the notification's main message string

---

### `getSound()`

```jsx
getSound();
```

Gets the sound string from the `aps` object

---

### `getCategory()`

```jsx
getCategory();
```

Gets the category string from the `aps` object

---

### `getAlert()`

```jsx
getAlert();
```

Gets the notification's main message from the `aps` object

---

### `getTitle()`

```jsx
getTitle();
```

Gets the notification's title from the `aps` object

---

### `getContentAvailable()`

```jsx
getContentAvailable();
```

Gets the content-available number from the `aps` object

---

### `getBadgeCount()`

```jsx
getBadgeCount();
```

Gets the badge count number from the `aps` object

---

### `getData()`

```jsx
getData();
```

Gets the data object on the notification

---

### `getThreadID()`

```jsx
getThreadID();
```

Gets the thread ID on the notification

[build-badge]: https://github.com/react-native-push-notification-ios/push-notification-ios/workflows/Build/badge.svg
[build]: https://github.com/react-native-push-notification-ios/push-notification-ios/actions
[version-badge]: https://img.shields.io/npm/v/@react-native-community/push-notification-ios.svg?style=flat-square
[package]: https://www.npmjs.com/package/@react-native-community/push-notification-ios
[license-badge]: https://img.shields.io/npm/l/@react-native-community/push-notification-ios.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT
[lean-core-badge]: https://img.shields.io/badge/Lean%20Core-Extracted-brightgreen.svg?style=flat-square
[lean-core-issue]: https://github.com/facebook/react-native/issues/23313
