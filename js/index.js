/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

import {NativeEventEmitter, NativeModules} from 'react-native';
import invariant from 'invariant';
import type {
  NotificationAlert,
  NotificationRequest,
  NotificationCategory,
  NotificationAction,
} from './types';
const {RNCPushNotificationIOS} = NativeModules;

const PushNotificationEmitter = new NativeEventEmitter(RNCPushNotificationIOS);

const _notifHandlers = new Map();

const DEVICE_NOTIF_EVENT = 'remoteNotificationReceived';
const NOTIF_REGISTER_EVENT = 'remoteNotificationsRegistered';
const NOTIF_REGISTRATION_ERROR_EVENT = 'remoteNotificationRegistrationError';
const DEVICE_LOCAL_NOTIF_EVENT = 'localNotificationReceived';

export type {
  NotificationAlert,
  NotificationRequest,
  NotificationCategory,
  NotificationAction,
};

export type ContentAvailable = 1 | null | void;

export type FetchResult = {
  NewData: string,
  NoData: string,
  ResultFailed: string,
};

export type AuthorizationStatus = {
  UNAuthorizationStatusNotDetermined: 0,
  UNAuthorizationStatusDenied: 1,
  UNAuthorizationStatusAuthorized: 2,
  UNAuthorizationStatusProvisional: 3,
};

/**
 * An event emitted by PushNotificationIOS.
 */
export type PushNotificationEventName = $Keys<{
  /**
   * Fired when a remote notification is received. The handler will be invoked
   * with an instance of `PushNotificationIOS`.
   */
  notification: string,
  /**
   * Fired when a local notification is received. The handler will be invoked
   * with an instance of `PushNotificationIOS`.
   */
  localNotification: string,
  /**
   * Fired when the user registers for remote notifications. The handler will be
   * invoked with a hex string representing the deviceToken.
   */
  register: string,
  /**
   * Fired when the user fails to register for remote notifications. Typically
   * occurs when APNS is having issues, or the device is a simulator. The
   * handler will be invoked with {message: string, code: number, details: any}.
   */
  registrationError: string,
}>;

/**
 *
 * Handle push notifications for your app, including permission handling and
 * icon badge number.
 *
 * See https://reactnative.dev/docs/pushnotificationios.html
 */
class PushNotificationIOS {
  _data: Object;
  _alert: string | NotificationAlert;
  _title: string;
  _subtitle: string;
  _sound: string;
  _category: string;
  _contentAvailable: ContentAvailable;
  _badgeCount: number;
  _notificationId: string;
  /**
   * The id of action the user has taken taken.
   */
  _actionIdentifier: ?string;
  /**
   * The text user has input if user responded with a text action.
   */
  _userText: ?string;
  _isRemote: boolean;
  _remoteNotificationCompleteCallbackCalled: boolean;
  _threadID: string;
  _fireDate: string | Date;

  static FetchResult: FetchResult = {
    NewData: 'UIBackgroundFetchResultNewData',
    NoData: 'UIBackgroundFetchResultNoData',
    ResultFailed: 'UIBackgroundFetchResultFailed',
  };

  static AuthorizationStatus: AuthorizationStatus = {
    UNAuthorizationStatusNotDetermined: 0,
    UNAuthorizationStatusDenied: 1,
    UNAuthorizationStatusAuthorized: 2,
    UNAuthorizationStatusProvisional: 3,
  };

  /**
   * Schedules the localNotification for immediate presentation.
   * @deprecated use `addNotificationRequest` instead
   */
  static presentLocalNotification(details: Object) {
    RNCPushNotificationIOS.presentLocalNotification(details);
  }

  /**
   * Schedules the localNotification for future presentation.
   * @deprecated use `addNotificationRequest` instead
   */
  static scheduleLocalNotification(details: Object) {
    RNCPushNotificationIOS.scheduleLocalNotification(details);
  }

  /**
   * Sends notificationRequest to notification center at specified firedate.
   * Fires immediately if firedate is not set.
   */
  static addNotificationRequest(request: NotificationRequest) {
    const handledRequest =
      request.fireDate instanceof Date
        ? {...request, fireDate: request.fireDate.toISOString()}
        : request;
    const finalRequest = {
      ...handledRequest,
      repeatsComponent: request.repeatsComponent || {},
    };

    RNCPushNotificationIOS.addNotificationRequest(finalRequest);
  }

  /**
   * Sets notification category to notification center.
   * Used to set specific actions for notifications that contains specified category
   */
  static setNotificationCategories(categories: NotificationCategory[]) {
    RNCPushNotificationIOS.setNotificationCategories(categories);
  }

  /**
   * Cancels all scheduled localNotifications.
   * @deprecated use `removeAllPendingNotificationRequests` instead
   * - This method is deprecated in iOS 10 and will be removed from future release
   */
  static cancelAllLocalNotifications() {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.cancelAllLocalNotifications();
  }

  /**
   * Removes all pending notifications
   */
  static removeAllPendingNotificationRequests() {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.removeAllPendingNotificationRequests();
  }

  /**
   * Removes pending notifications with given identifier strings.
   */
  static removePendingNotificationRequests(identifiers: string[]) {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.removePendingNotificationRequests(identifiers);
  }

  /**
   * Remove all delivered notifications from Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removealldeliverednotifications
   */
  static removeAllDeliveredNotifications(): void {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.removeAllDeliveredNotifications();
  }

  /**
   * Provides you with a list of the app’s notifications that are still displayed in Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getdeliverednotifications
   */
  static getDeliveredNotifications(
    callback: (notifications: Array<Object>) => void,
  ): void {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.getDeliveredNotifications(callback);
  }

  /**
   * Removes the specified notifications from Notification Center
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removedeliverednotifications
   */
  static removeDeliveredNotifications(identifiers: Array<string>): void {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.removeDeliveredNotifications(identifiers);
  }

  /**
   * Sets the badge number for the app icon on the home screen.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#setapplicationiconbadgenumber
   */
  static setApplicationIconBadgeNumber(number: number) {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.setApplicationIconBadgeNumber(number);
  }

  /**
   * Gets the current badge number for the app icon on the home screen.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getapplicationiconbadgenumber
   */
  static getApplicationIconBadgeNumber(callback: Function) {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.getApplicationIconBadgeNumber(callback);
  }

  /**
   * Cancel local notifications.
   * @deprecated - use `removePendingNotifications`
   * See https://reactnative.dev/docs/pushnotificationios.html#cancellocalnotification
   */
  static cancelLocalNotifications(userInfo: Object) {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.cancelLocalNotifications(userInfo);
  }

  /**
   * Gets the local notifications that are currently scheduled.
   * @deprecated - use `getPendingNotificationRequests`
   */
  static getScheduledLocalNotifications(callback: Function) {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.getScheduledLocalNotifications(callback);
  }

  /**
   * Gets the pending local notification requests.
   */
  static getPendingNotificationRequests(
    callback: (requests: NotificationRequest[]) => void,
  ) {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.getPendingNotificationRequests(callback);
  }

  /**
   * Attaches a listener to remote or local notification events while the app
   * is running in the foreground or the background.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#addeventlistener
   */
  static addEventListener(type: PushNotificationEventName, handler: Function) {
    invariant(
      type === 'notification' ||
        type === 'register' ||
        type === 'registrationError' ||
        type === 'localNotification',
      'PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events',
    );
    let listener;
    if (type === 'notification') {
      listener = PushNotificationEmitter.addListener(
        DEVICE_NOTIF_EVENT,
        (notifData) => {
          handler(new PushNotificationIOS(notifData));
        },
      );
    } else if (type === 'localNotification') {
      listener = PushNotificationEmitter.addListener(
        DEVICE_LOCAL_NOTIF_EVENT,
        (notifData) => {
          handler(new PushNotificationIOS(notifData));
        },
      );
    } else if (type === 'register') {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTER_EVENT,
        (registrationInfo) => {
          handler(registrationInfo.deviceToken);
        },
      );
    } else if (type === 'registrationError') {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTRATION_ERROR_EVENT,
        (errorInfo) => {
          handler(errorInfo);
        },
      );
    }
    _notifHandlers.set(type, listener);
  }

  /**
   * Removes the event listener. Do this in `componentWillUnmount` to prevent
   * memory leaks.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removeeventlistener
   */
  static removeEventListener(type: PushNotificationEventName) {
    invariant(
      type === 'notification' ||
        type === 'register' ||
        type === 'registrationError' ||
        type === 'localNotification',
      'PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events',
    );
    const listener = _notifHandlers.get(type);
    if (!listener) {
      return;
    }
    listener.remove();
    _notifHandlers.delete(type);
  }

  /**
   * Requests notification permissions from iOS, prompting the user's
   * dialog box. By default, it will request all notification permissions, but
   * a subset of these can be requested by passing a map of requested
   * permissions.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#requestpermissions
   */
  static requestPermissions(permissions?: {
    alert?: boolean,
    badge?: boolean,
    sound?: boolean,
    critical?: boolean,
  }): Promise<{
    alert: boolean,
    badge: boolean,
    sound: boolean,
    critical: boolean,
  }> {
    let requestedPermissions = {
      alert: true,
      badge: true,
      sound: true,
    };
    if (permissions) {
      requestedPermissions = {
        alert: !!permissions.alert,
        badge: !!permissions.badge,
        sound: !!permissions.sound,
        critical: !!permissions.critical,
      };
    }
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    return RNCPushNotificationIOS.requestPermissions(requestedPermissions);
  }

  /**
   * Unregister for all remote notifications received via Apple Push Notification service.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#abandonpermissions
   */
  static abandonPermissions() {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.abandonPermissions();
  }

  /**
   * See what push permissions are currently enabled. `callback` will be
   * invoked with a `permissions` object.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#checkpermissions
   */
  static checkPermissions(callback: Function) {
    invariant(typeof callback === 'function', 'Must provide a valid callback');
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.checkPermissions(callback);
  }

  /**
   * This method returns a promise that resolves to either the notification
   * object if the app was launched by a push notification, or `null` otherwise.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getinitialnotification
   */
  static getInitialNotification(): Promise<?PushNotificationIOS> {
    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    return RNCPushNotificationIOS.getInitialNotification().then(
      (notification) => {
        return notification && new PushNotificationIOS(notification);
      },
    );
  }

  /**
   * You will never need to instantiate `PushNotificationIOS` yourself.
   * Listening to the `notification` event and invoking
   * `getInitialNotification` is sufficient
   *
   */
  constructor(nativeNotif: Object) {
    this._data = {};
    this._remoteNotificationCompleteCallbackCalled = false;
    this._isRemote = nativeNotif.remote;
    if (this._isRemote) {
      this._notificationId = nativeNotif.notificationId;
    }

    this._actionIdentifier = nativeNotif.actionIdentifier;
    this._userText = nativeNotif.userText;
    if (nativeNotif.remote) {
      // Extract data from Apple's `aps` dict as defined:
      // https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html
      Object.keys(nativeNotif).forEach((notifKey) => {
        const notifVal = nativeNotif[notifKey];

        if (notifKey === 'aps') {
          this._alert = notifVal.alert;
          this._title = notifVal?.alertTitle;
          this._subtitle = notifVal?.subtitle;
          this._sound = notifVal.sound;
          this._badgeCount = notifVal.badge;
          this._category = notifVal.category;
          this._contentAvailable = notifVal['content-available'];
          this._threadID = notifVal['thread-id'];
          this._fireDate = notifVal.fireDate;
        } else {
          this._data[notifKey] = notifVal;
        }
      });
    } else {
      // Local notifications aren't being sent down with `aps` dict.
      // TODO: remove applicationIconBadgeNumber on next major version
      this._badgeCount =
        nativeNotif.badge || nativeNotif.applicationIconBadgeNumber;
      // TODO: remove soundName on next major version
      this._sound = nativeNotif.sound || nativeNotif.soundName;
      this._alert = nativeNotif.body;
      this._title = nativeNotif?.title;
      this._subtitle = nativeNotif?.subtitle;
      this._threadID = nativeNotif['thread-id'];
      this._data = nativeNotif.userInfo;
      this._category = nativeNotif.category;
      this._fireDate = nativeNotif.fireDate;
    }
  }

  /**
   * This method is available for remote notifications that have been received via:
   * `application:didReceiveRemoteNotification:fetchCompletionHandler:`
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#finish
   */
  finish(fetchResult: string) {
    if (
      !this._isRemote ||
      !this._notificationId ||
      this._remoteNotificationCompleteCallbackCalled
    ) {
      return;
    }
    this._remoteNotificationCompleteCallbackCalled = true;

    invariant(
      RNCPushNotificationIOS,
      'PushNotificationManager is not available.',
    );
    RNCPushNotificationIOS.onFinishRemoteNotification(
      this._notificationId,
      fetchResult,
    );
  }

  /**
   * An alias for `getAlert` to get the notification's main message string
   */
  getMessage(): ?string | ?Object {
    if (typeof this._alert === 'object') {
      return this._alert?.body;
    }
    return this._alert;
  }

  /**
   * Gets the sound string from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getsound
   */
  getSound(): ?string {
    return this._sound;
  }

  /**
   * Gets the category string from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getcategory
   */
  getCategory(): ?string {
    return this._category;
  }

  /**
   * Gets the notification's main message from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getalert
   */
  getAlert(): ?string | ?Object {
    return this._alert;
  }

  /**
   * Gets the notification's title from the `aps` object
   *
   */
  getTitle(): ?string | ?Object {
    if (typeof this._alert === 'object') {
      return this._alert?.title;
    }
    return this._title;
  }

  /**
   * Gets the notification's subtitle from the `aps` object
   *
   */
  getSubtitle(): ?string | ?Object {
    if (typeof this._alert === 'object') {
      return this._alert?.subtitle;
    }
    return this._subtitle;
  }

  /**
   * Gets the content-available number from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getcontentavailable
   */
  getContentAvailable(): ContentAvailable {
    return this._contentAvailable;
  }

  /**
   * Gets the badge count number from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getbadgecount
   */
  getBadgeCount(): ?number {
    return this._badgeCount;
  }

  /**
   * Gets the data object on the notif
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getdata
   */
  getData(): ?Object {
    return this._data;
  }

  /**
   * Gets the thread ID on the notif
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getthreadid
   */
  getThreadID(): ?string {
    return this._threadID;
  }

  /**
   * Get's the action id of the notification action user has taken.
   */
  getActionIdentifier(): ?string {
    return this._actionIdentifier;
  }

  /**
   * Gets the text user has inputed if user has taken the text action response.
   */
  getUserText(): ?string {
    return this._userText;
  }
}

export default PushNotificationIOS;
