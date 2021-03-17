/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Button,
  Text,
  FlatList,
} from 'react-native';
import {NativeEventEmitter, NativeModules} from 'react-native';
import ReactNativeAN from 'react-native-alarm-notification';
import moment from 'moment';

const alarmData = {
  auto_cancel: true,
  title: 'Pengingat Obat',
  message: 'Jangan lupa hari ini minum obat Anda',
  vibrate: true,
  play_sound: true,
  loop_sound: true,
  has_button: true,
  snooze_interval: 5,
  schedule_type: 'repeat',
  repeat_interval: 'daily',
  color: '#2B8562',
};

export default function App() {
  const {RNAlarmNotification} = NativeModules;
  const RNAlarmEmitter = new NativeEventEmitter(RNAlarmNotification);
  const [data, setData] = useState([]);

  const createAlarm = async fire_date => {
    const alarmToCreate = {
      ...alarmData,
      fire_date,
    };
    try {
      await ReactNativeAN.scheduleAlarm(alarmToCreate);
    } catch (e) {}
  };

  const createDirectAlarm = async () => {
    const alarmToCreate = {
      auto_cancel: true,
      title: 'Pengingat Obat',
      message: 'Jangan lupa hari ini minum obat Anda',
      vibrate: true,
      play_sound: true,
      loop_sound: true,
      has_button: true,
      snooze_interval: 5,
      schedule_type: 'once',
      color: '#2B8562',
      fire_date: moment().add(10, 'seconds').format(`DD-MM-YYYY HH:mm:ss`),
    };
    try {
      const alarm = await ReactNativeAN.scheduleAlarm(alarmToCreate);
      console.log(alarm);
    } catch (e) {
      console.log(e);
    }
  };

  const createAllAlarm = async () => {
    for (let i = 9; i <= 18; i++) {
      let fire_date;
      if (moment(i, 'HH').format() < moment().format()) {
        fire_date = moment(i, 'H').add(1, 'days').format(`DD-MM-YYYY HH:00:00`);
      } else {
        fire_date = moment(i, 'H').format(`DD-MM-YYYY HH:00:00`);
      }
      await createAlarm(fire_date);
    }
    const alarms = await ReactNativeAN.getScheduledAlarms();
    console.log(alarms)
    setData(alarms);
  };

  const deleteAllAlarms = async () => {
    const allAlarms = await ReactNativeAN.getScheduledAlarms();
    for (let i = 0; i < allAlarms.length; i++) {
      ReactNativeAN.deleteAlarm(allAlarms[i].id);
    }
    setData([]);
    await ReactNativeAN.getScheduledAlarms();
  };

  useEffect(() => {
    RNAlarmEmitter.addListener('OnNotificationDismissed', data => {
      // console.log('OnNotificationDismissed :', data);
      const obj = JSON.parse(data);
      let alarmId = Number.parseInt(obj.id);
      if (alarmId) {
        ReactNativeAN.removeFiredNotification(alarmId);
      }
      ReactNativeAN.stopAlarmSound();
    });

    RNAlarmEmitter.addListener('OnNotificationOpened', data => {
      // console.log('OnNotificationOpened :', data);
      ReactNativeAN.stopAlarmSound();
    });

    return () => {
      RNAlarmEmitter.removeListener('OnNotificationDismissed');
      RNAlarmEmitter.removeListener('OnNotificationOpened');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Create Alarms" onPress={createAllAlarm} />
      <View style={{height: 20}} />
      {/* <Button title="Create 10s Alarm" onPress={createDirectAlarm} />
      <View style={{height: 20}} />
      <Button title="Delete Alarms" onPress={deleteAllAlarms} /> */}
      <View style={{height: 20}} />
      <Button
        title="Stop sound"
        onPress={() => ReactNativeAN.stopAlarmSound()}
      />
      <View style={{height: 30}} />
      <FlatList
        data={data}
        renderItem={({item, index}) => {
          return (
            <Text style={{marginBottom: 10}}>
              {index + 1}. Dimulai tanggal {item.day}, jam {item.hour}
            </Text>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 50,
  },
});
