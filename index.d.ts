// Type definitions for @react-native-community/push-notification-ios 1.0.2
// Project: https://github.com/react-native-community/react-native-push-notification-ios
// Definitions by: Jules Sam. Randolph <https://github.com/jsamr>

export interface FetchResult {
  NewData: 'UIBackgroundFetchResultNewData';
  NoData: 'UIBackgroundFetchResultNoData';
  ResultFailed: 'UIBackgroundFetchResultFailed';
}

export interface PushNotification {
  /**
   * An alias for `getAlert` to get the notification's main message string
   */
  getMessage(): string | Record<string, any>;

  /**
   * Gets the sound string from the `aps` object
   */
  getSound(): string;

  /**
   * Gets the category string from the `aps` object
   */
  getCategory(): string;

  /**
   * Gets the notification's main message from the `aps` object
   */
  getAlert(): string | Record<string, any>;

  /**
   * Gets the content-available number from the `aps` object
   */
  getContentAvailable(): number;

  /**
   * Gets the badge count number from the `aps` object
   */
  getBadgeCount(): number;

  /**
   * Gets the data object on the notif
   */
  getData(): Record<string, any>;

  /**
   * iOS Only
   * Signifies remote notification handling is complete
   */
  finish(result: string): void;
}

export interface PresentLocalNotificationDetails {
  /**
   * The "action" displayed beneath an actionable notification. Defaults to "view";
   */
  alertAction?: string;
  /**
   * The message displayed in the notification alert.
   */
  alertBody: string;
  /**
   * The text displayed as the title of the notification alert.
   */
  alertTitle?: string;
  /**
   * The number to display as the app's icon badge. Setting the number to 0 removes the icon badge. (optional)
   */
  applicationIconBadgeNumber?: number;
  /**
   * The category of this notification, required for actionable notifications. (optional)
   */
  category?: string;
  /**
   * The sound played when the notification is fired (optional).
   */
  soundName?: string;
  /**
   * If true, the notification will appear without sound (optional).
   */
  isSilent?: boolean;
  /**
   * An object containing additional notification data (optional).
   */
  userInfo?: Record<string, any>;
}

export interface ScheduleLocalNotificationDetails {
  /**
   * The "action" displayed beneath an actionable notification. Defaults to "view";
   */
  alertAction?: string;
  /**
   * The message displayed in the notification alert.
   */
  alertBody: string;
  /**
   * The text displayed as the title of the notification alert.
   */
  alertTitle?: string;
  /**
   * The number to display as the app's icon badge. Setting the number to 0 removes the icon badge. (optional)
   */
  applicationIconBadgeNumber?: number;
  /**
   * The category of this notification, required for actionable notifications. (optional)
   */
  category?: string;
  /**
   * The date and time when the system should deliver the notification.
   * Use Date.toISOString() to convert to the expected format
   */
  fireDate: string;
  /**
   * The sound played when the notification is fired (optional).
   */
  soundName?: string;
  /**
   * If true, the notification will appear without sound (optional).
   */
  isSilent?: boolean;
  /**
   * An object containing additional notification data (optional).
   */
  userInfo?: Record<string, any>;
  /**
   * The interval to repeat as a string. Possible values: minute, hour, day, week, month, year.
   */
  repeatInterval?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
}

export type DeliveredNotification = {
  identifier: string;
  title: string;
  body: string;
  category?: string;
  userInfo?: Record<string, any>;
  'thread-id'?: string;
};

export interface PushNotificationPermissions {
  alert?: boolean;
  badge?: boolean;
  sound?: boolean;
}

export type PushNotificationEventName =
  | 'notification'
  | 'localNotification'
  | 'register'
  | 'registrationError';

/**
 * Handle push notifications for your app, including permission handling and icon badge number.
 * @see https://reactnative.dev/docs/pushnotificationios.html#content
 *
 * //FIXME: BGR: The documentation seems completely off compared to the actual js implementation. I could never get the example to run
 */
export interface PushNotificationIOSStatic {
  /**
   * iOS fetch results that best describe the result of a finished remote notification handler.
   * For a list of possible values, see `PushNotificationIOS.FetchResult`.
   */
  FetchResult: FetchResult;
  /**
   * Schedules the localNotification for immediate presentation.
   * details is an object containing:
   * alertBody : The message displayed in the notification alert.
   * alertAction : The "action" displayed beneath an actionable notification. Defaults to "view";
   * soundName : The sound played when the notification is fired (optional).
   * category : The category of this notification, required for actionable notifications (optional).
   * userInfo : An optional object containing additional notification data.
   * applicationIconBadgeNumber (optional) : The number to display as the app's icon badge. The default value of this property is 0, which means that no badge is displayed.
   */
  presentLocalNotification(details: PresentLocalNotificationDetails): void;

  /**
   * Schedules the localNotification for future presentation.
   * details is an object containing:
   * fireDate : The date and time when the system should deliver the notification.
   * alertBody : The message displayed in the notification alert.
   * alertAction : The "action" displayed beneath an actionable notification. Defaults to "view";
   * soundName : The sound played when the notification is fired (optional).
   * category : The category of this notification, required for actionable notifications (optional).
   * userInfo : An optional object containing additional notification data.
   * applicationIconBadgeNumber (optional) : The number to display as the app's icon badge. Setting the number to 0 removes the icon badge.
   */
  scheduleLocalNotification(details: ScheduleLocalNotificationDetails): void;

  /**
   * Cancels all scheduled localNotifications
   */
  cancelAllLocalNotifications(): void;

  /**
   * Remove all delivered notifications from Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removealldeliverednotifications
   */
  removeAllDeliveredNotifications(): void;

  /**
   * Provides you with a list of the app’s notifications that are still displayed in Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getdeliverednotifications
   */
  getDeliveredNotifications(
    callback: (notifications: Record<string, any>[]) => void,
  ): DeliveredNotification;

  /**
   * Removes the specified notifications from Notification Center
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removedeliverednotifications
   */
  removeDeliveredNotifications(identifiers: string[]): void;

  /**
   * Sets the badge number for the app icon on the home screen
   */
  setApplicationIconBadgeNumber(number: number): void;

  /**
   * Gets the current badge number for the app icon on the home screen
   */
  getApplicationIconBadgeNumber(callback: (badge: number) => void): void;

  /**
   * Cancel local notifications.
   * Optionally restricts the set of canceled notifications to those notifications whose userInfo fields match the corresponding fields in the userInfo argument.
   */
  cancelLocalNotifications(userInfo: Record<string, any>): void;

  /**
   * Gets the local notifications that are currently scheduled.
   */
  getScheduledLocalNotifications(
    callback: (notifications: ScheduleLocalNotificationDetails[]) => void,
  ): void;

  /**
   * Attaches a listener to remote notifications while the app is running in the
   * foreground or the background.
   *
   * The handler will get be invoked with an instance of `PushNotificationIOS`
   *
   * The type MUST be 'notification'
   */
  addEventListener(
    type: 'notification' | 'localNotification',
    handler: (notification: PushNotification) => void,
  ): void;

  /**
   * Fired when the user registers for remote notifications.
   *
   * The handler will be invoked with a hex string representing the deviceToken.
   *
   * The type MUST be 'register'
   */
  addEventListener(
    type: 'register',
    handler: (deviceToken: string) => void,
  ): void;

  /**
   * Fired when the user fails to register for remote notifications.
   * Typically occurs when APNS is having issues, or the device is a simulator.
   *
   * The handler will be invoked with {message: string, code: number, details: any}.
   *
   * The type MUST be 'registrationError'
   */
  addEventListener(
    type: 'registrationError',
    handler: (error: {message: string; code: number; details: any}) => void,
  ): void;

  /**
   * Removes the event listener. Do this in `componentWillUnmount` to prevent
   * memory leaks
   */
  removeEventListener(
    type: PushNotificationEventName,
    handler:
      | ((notification: PushNotification) => void)
      | ((deviceToken: string) => void)
      | ((error: {message: string; code: number; details: any}) => void),
  ): void;

  /**
   * Requests all notification permissions from iOS, prompting the user's
   * dialog box.
   */
  requestPermissions(
    permissions?: PushNotificationPermissions[] | PushNotificationPermissions,
  ): Promise<PushNotificationPermissions>;

  /**
   * Unregister for all remote notifications received via Apple Push
   * Notification service.
   * You should call this method in rare circumstances only, such as when
   * a new version of the app removes support for all types of remote
   * notifications. Users can temporarily prevent apps from receiving
   * remote notifications through the Notifications section of the
   * Settings app. Apps unregistered through this method can always
   * re-register.
   */
  abandonPermissions(): void;

  /**
   * See what push permissions are currently enabled. `callback` will be
   * invoked with a `permissions` object:
   *
   *  - `alert` :boolean
   *  - `badge` :boolean
   *  - `sound` :boolean
   */
  checkPermissions(
    callback: (permissions: PushNotificationPermissions) => void,
  ): void;

  /**
   * This method returns a promise that resolves to either the notification
   * object if the app was launched by a push notification, or `null` otherwise.
   */
  getInitialNotification(): Promise<PushNotification | null>;
}

declare const PushNotificationIOS: PushNotificationIOSStatic;

export default PushNotificationIOS;
