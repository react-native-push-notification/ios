/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @flow
 */

import React, {useState, useEffect} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  DeviceEventEmitter,
} from 'react-native';
import PushNotificationIOS from '../js';

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

export const App = () => {
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    PushNotificationIOS.addEventListener('register', onRegistered);
    PushNotificationIOS.addEventListener(
      'registrationError',
      onRegistrationError,
    );
    PushNotificationIOS.addEventListener('notification', onRemoteNotification);
    PushNotificationIOS.addEventListener(
      'localNotification',
      onLocalNotification,
    );

    PushNotificationIOS.requestPermissions().then(
      (data) => {
        console.log('PushNotificationIOS.requestPermissions', data);
      },
      (data) => {
        console.log('PushNotificationIOS.requestPermissions failed', data);
      },
    );

    return () => {
      PushNotificationIOS.removeEventListener('register', onRegistered);
      PushNotificationIOS.removeEventListener(
        'registrationError',
        onRegistrationError,
      );
      PushNotificationIOS.removeEventListener(
        'notification',
        onRemoteNotification,
      );
      PushNotificationIOS.removeEventListener(
        'localNotification',
        onLocalNotification,
      );
    };
  }, []);

  const sendNotification = () => {
    DeviceEventEmitter.emit('remoteNotificationReceived', {
      remote: true,
      aps: {
        alert: 'Sample notification',
        badge: '+1',
        sound: 'default',
        category: 'REACT_NATIVE',
        'content-available': 1,
      },
    });
  };

  const sendLocalNotification = () => {
    PushNotificationIOS.presentLocalNotification({
      alertTitle: 'Sample Title',
      alertBody: 'Sample local notification',
      applicationIconBadgeNumber: 1,
    });
  };

  const scheduleLocalNotification = () => {
    PushNotificationIOS.scheduleLocalNotification({
      alertBody: 'Test Local Notification',
      fireDate: new Date().toISOString(),
    });
  };

  const onRegistered = (deviceToken) => {
    Alert.alert('Registered For Remote Push', `Device Token: ${deviceToken}`, [
      {
        text: 'Dismiss',
        onPress: null,
      },
    ]);
  };

  const onRegistrationError = (error) => {
    Alert.alert(
      'Failed To Register For Remote Push',
      `Error (${error.code}): ${error.message}`,
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  };

  const onRemoteNotification = (notification) => {
    const result = `Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()}.`;

    Alert.alert('Push Notification Received', result, [
      {
        text: 'Dismiss',
        onPress: null,
      },
    ]);
  };

  const onLocalNotification = (notification) => {
    Alert.alert(
      'Local Notification Received',
      'Alert message: ' + notification.getMessage(),
      [
        {
          text: 'Dismiss',
          onPress: null,
        },
      ],
    );
  };

  const showPermissions = () => {
    PushNotificationIOS.checkPermissions((permissions) => {
      setPermissions({permissions});
    });
  };

  return (
    <View style={styles.container}>
      <Button onPress={sendNotification} label="Send fake notification" />

      <Button
        onPress={sendLocalNotification}
        label="Send fake local notification"
      />
      <Button
        onPress={scheduleLocalNotification}
        label="Schedule fake local notification"
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
        <Button onPress={showPermissions} label="Show enabled permissions" />
        <Text>{JSON.stringify(permissions)}</Text>
      </View>
    </View>
  );
};

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
