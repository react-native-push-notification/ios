// Type definitions for @react-native-community/push-notification-ios 1.0.2
// Project: https://github.com/react-native-community/push-notification-ios
// Definitions by: Jules Sam. Randolph <https://github.com/jsamr>

export interface FetchResult {
  NewData: 'UIBackgroundFetchResultNewData';
  NoData: 'UIBackgroundFetchResultNoData';
  ResultFailed: 'UIBackgroundFetchResultFailed';
}

export interface AuthorizationStatus {
  UNAuthorizationStatusNotDetermined: 0;
  UNAuthorizationStatusDenied: 1;
  UNAuthorizationStatusAuthorized: 2;
  UNAuthorizationStatusProvisional: 3;
}

/**
 * Alert Object that can be included in the aps `alert` object
 */
export type NotificationAlert = {
  title?: string;
  subtitle?: string;
  body?: string;
};

/**
 * Notification Category that can include specific actions
 */
export type NotificationCategory = {
  id: string;
  actions: NotificationAction[];
};

/**
 * Notification Action that can be added to specific categories
 */
export type NotificationAction = {
  /**
   * Id of Action.
   * This value will be returned as actionIdentifier when notification is received.
   */
  id: string;
  /**
   * Text to be shown on notification action button.
   */
  title: string;
  /**
   * Option for notification action.
   */
  options?: {
    foreground?: boolean;
    destructive?: boolean;
    authenticationRequired?: boolean;
  };
  /**
   * Option for textInput action.
   * If textInput prop exists, then user action will automatically become a text input action.
   * The text user inputs will be in the userText field of the received notification.
   */
  textInput?: {
    /**
     * Text to be shown on button when user finishes text input.
     * Default is "Send" or its equivalent word in user's language setting.
     */
    buttonTitle?: string;
    /**
     * Placeholder for text input for text input action.
     */
    placeholder?: string;
  };
};

export interface PushNotification {
  /**
   * An alias for `getAlert` to get the notification's main message string
   */
  getMessage(): string | NotificationAlert;

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
  getAlert(): string | NotificationAlert;

  /**
   * Gets the notification's title from the `aps` object
   */
  getTitle(): string;

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
   * Get's the action id of the notification action user has taken.
   */
  getActionIdentifier(): string | undefined;

  /**
   * Gets the text user has inputed if user has taken the text action response.
   */
  getUserText(): string | undefined;

  /**
   * iOS Only
   * Signifies remote notification handling is complete
   */
  finish(result: string): void;
}

export type NotificationRequest = {
  /**
   * identifier of the notification.
   * Required in order to retrieve specific notification.
   */
  id: string;
  /**
   * A short description of the reason for the alert.
   */
  title?: string;
  /**
   * A secondary description of the reason for the alert.
   */
  subtitle?: string;
  /**
   * The message displayed in the notification alert.
   */
  body?: string;
  /**
   * The number to display as the app's icon badge.
   */
  badge?: number;
  /**
   * The sound to play when the notification is delivered.
   * The file should be added in the ios project from Xcode, on your target, so that it is bundled in the final app.
   * For more details see the example app.
   */
  sound?: string;
  /**
   * The category of this notification. Required for actionable notifications.
   */
  category?: string;
  /**
   * The thread identifier of this notification.
   */
  threadId?: string;
  /**
   * The date which notification triggers.
   */
  fireDate?: Date;
  /**
   * Sets notification to repeat daily.
   * Must be used with fireDate.
   */
  repeats?: boolean;
  /**
   * Define what components should be used in the fireDate during repeats.
   * Must be used with repeats and fireDate.
   */
  repeatsComponent?: {
    year?: boolean;
    month?: boolean;
    day?: boolean;
    dayOfWeek?: boolean;
    hour?: boolean;
    minute?: boolean;
    second?: boolean;
  };
  /**
   * Sets notification to be silent
   */
  isSilent?: boolean;
  /**
   * Sets notification to be critical
   */
  isCritical?: boolean;
  /**
   * The volume for the critical alert’s sound. Set this to a value between 0.0 (silent) and 1.0 (full volume).
   */
  criticalSoundVolume?: number;
  /**
   * Optional data to be added to the notification
   */
  userInfo?: Record<string, any>;
};

/**
 * @deprecated see `NotificationRequest`
 * - This type will be removed in the next major version
 */
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
   * The file should be added in the ios project from Xcode, on your target, so that it is bundled in the final app
   * For more details see the example app.
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

/**
 * @deprecated see `NotificationRequest`
 * - This type will be removed in the next major version
 */
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
   * The file should be added in the ios project from Xcode, on your target, so that it is bundled in the final app
   * For more details see the example app.
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
  subtitle: string;
  body: string;
  category?: string;
  actionIdentifier?: string;
  userText?: string;
  userInfo?: Record<string, any>;
  'thread-id'?: string;
};

export interface PushNotificationPermissions {
  alert?: boolean;
  badge?: boolean;
  sound?: boolean;
  critical?: boolean;
  lockScreen?: boolean;
  notificationCenter?: boolean;
  authorizationStatus?: AuthorizationStatus[keyof AuthorizationStatus];
}

export type PushNotificationEventName =
  | 'notification'
  | 'localNotification'
  | 'register'
  | 'registrationError';

/**
 * Handle push notifications for your app, including permission handling and icon badge number.
 */
export interface PushNotificationIOSStatic {
  /**
   * iOS fetch results that best describe the result of a finished remote notification handler.
   * For a list of possible values, see `PushNotificationIOS.FetchResult`.
   */
  FetchResult: FetchResult;
  /**
   * Authorization status of notification settings
   * For a list of possible values, see `PushNotificationIOS.AuthorizationStatus`.
   */
  AuthorizationStatus: AuthorizationStatus;
  /**
   * @deprecated use `addNotificationRequest`
   * Schedules the localNotification for immediate presentation.
   * details is an object containing:
   * alertBody : The message displayed in the notification alert.
   * alertAction : The "action" displayed beneath an actionable notification. Defaults to "view";
   * soundName : The sound played when the notification is fired (optional). The file should be added in the ios project from Xcode, on your target, so that it is bundled in the final app. For more details see the example app.
   * category : The category of this notification, required for actionable notifications (optional).
   * userInfo : An optional object containing additional notification data.
   * applicationIconBadgeNumber (optional) : The number to display as the app's icon badge. The default value of this property is 0, which means that no badge is displayed.
   */
  presentLocalNotification(details: PresentLocalNotificationDetails): void;

  /**
   * @deprecated use `addNotificationRequest`
   * Schedules the localNotification for future presentation.
   * details is an object containing:
   * fireDate : The date and time when the system should deliver the notification.
   * alertBody : The message displayed in the notification alert.
   * alertAction : The "action" displayed beneath an actionable notification. Defaults to "view";
   * soundName : The sound played when the notification is fired (optional). The file should be added in the ios project from Xcode, on your target, so that it is bundled in the final app. For more details see the example app.
   * category : The category of this notification, required for actionable notifications (optional).
   * userInfo : An optional object containing additional notification data.
   * applicationIconBadgeNumber (optional) : The number to display as the app's icon badge. Setting the number to 0 removes the icon badge.
   */
  scheduleLocalNotification(details: ScheduleLocalNotificationDetails): void;

  /**
   * Sends notificationRequest to notification center at specified firedate.
   * Fires immediately if firedate is not set.
   */
  addNotificationRequest(request: NotificationRequest): void;

  /**
   * Cancels all scheduled localNotifications
   * @deprecated use `removeAllPendingNotificationRequests` instead
   * - This method is deprecated in iOS 10 and will be removed from future release
   */
  cancelAllLocalNotifications(): void;

  /**
   * Removes all pending notifications
   */
  removeAllPendingNotificationRequests(): void;

  /**
   * Removes specified pending notifications from Notification Center.
   */
  removePendingNotificationRequests(identifiers: string[]): void;

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
   * @deprecated use `removeAllPendingNotificationRequests`
   * - This method will be removed in the next major version
   * - Cancel local notifications.
   * - Optionally restricts the set of canceled notifications to those notifications whose userInfo fields match the corresponding fields in the userInfo argument.
   */
  cancelLocalNotifications(userInfo: Record<string, any>): void;

  /**
   * @deprecated use `getPendingNotificationRequests`
   * - This method will be removed in the next major version
   * - Gets the local notifications that are currently scheduled.
   */
  getScheduledLocalNotifications(
    callback: (notifications: ScheduleLocalNotificationDetails[]) => void,
  ): void;

  /**
   * - Gets all pending notification requests that are currently scheduled.
   */
  getPendingNotificationRequests(
    callback: (notifications: NotificationRequest[]) => void,
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
  removeEventListener(type: PushNotificationEventName): void;

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

  /**
   * Sets notification category to notification center.
   * Used to set specific actions for notifications that contains specified category
   */
  setNotificationCategories(categories: NotificationCategory[]): void;
}

declare const PushNotificationIOS: PushNotificationIOSStatic;

export default PushNotificationIOS;
