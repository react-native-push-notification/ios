/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {
  AlertIOS,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

class Button extends React.Component<$FlowFixMeProps> {
  render() {
    return (
      <TouchableHighlight
        underlayColor={'white'}
        style={styles.button}
        onPress={this.props.onPress}>
        <Text style={styles.buttonLabel}>{this.props.label}</Text>
      </TouchableHighlight>
    );
  }
}

type Props = {};
type State = {
  permissions: Object,
};
export default class App extends Component<Props, State> {
  state = {
    permissions: {},
  };

  UNSAFE_componentWillMount() {
    PushNotificationIOS.addEventListener('register', this._onRegistered);
    PushNotificationIOS.addEventListener(
      'registrationError',
      this._onRegistrationError,
    );
    PushNotificationIOS.addEventListener(
      'notification',
      this._onRemoteNotification,
    );
    PushNotificationIOS.addEventListener(
      'localNotification',
      this._onLocalNotification,
    );

    PushNotificationIOS.requestPermissions();
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('register', this._onRegistered);
    PushNotificationIOS.removeEventListener(
      'registrationError',
      this._onRegistrationError,
    );
    PushNotificationIOS.removeEventListener(
      'notification',
      this._onRemoteNotification,
    );
    PushNotificationIOS.removeEventListener(
      'localNotification',
      this._onLocalNotification,
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={this._sendNotification}
          label="Send fake notification"
        />

        <Button
          onPress={this._sendLocalNotification}
          label="Send fake local notification"
        />
        <Button
          onPress={() => PushNotificationIOS.setApplicationIconBadgeNumber(42)}
          label="Set app's icon badge to 42"
        />
        <Button
          onPress={() => PushNotificationIOS.setApplicationIconBadgeNumber(0)}
          label="Clear app's icon badge"
        />
        <View>
          <Button
            onPress={this._showPermissions.bind(this)}
            label="Show enabled permissions"
          />
          <Text>{JSON.stringify(this.state.permissions)}</Text>
        </View>
      </View>
    );
  }

  _sendNotification() {
    require('RCTDeviceEventEmitter').emit('remoteNotificationReceived', {
      remote: true,
      aps: {
        alert: 'Sample notification',
        badge: '+1',
        sound: 'default',
        category: 'REACT_NATIVE',
        'content-available': 1,
      },
    });
  }

  _sendLocalNotification() {
    PushNotificationIOS.presentLocalNotification({
      alertBody: 'Sample local notification',
      applicationIconBadgeNumber: 1,
    });
  }

  _onRegistered(deviceToken) {
    AlertIOS.alert(
      'Registered For Remote Push',
      `Device Token: ${deviceToken}`,
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  }

  _onRegistrationError(error) {
    AlertIOS.alert(
      'Failed To Register For Remote Push',
      `Error (${error.code}): ${error.message}`,
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  }

  _onRemoteNotification(notification) {
    const result = `Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()}.`;

    AlertIOS.alert('Push Notification Received', result, [
      {
        text: 'Dismiss',
        onPress: null,
      },
    ]);
  }

  _onLocalNotification(notification) {
    AlertIOS.alert(
      'Local Notification Received',
      'Alert message: ' + notification.getMessage(),
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  }

  _showPermissions() {
    PushNotificationIOS.checkPermissions(permissions => {
      this.setState({permissions});
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'blue',
  },
});
