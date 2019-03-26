/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";
import { AsyncStorage } from "react-native";
import firebase from "react-native-firebase";

interface Props {
}

interface State {
    name: string;
    token: string;
}

export default class App extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            name: "Test Push Notification !",
            token: "",
        };
    }

    public async componentDidMount() {
        this.checkPermission();
        this.createNotificationListeners();
    }

    public componentWillUnmount() {
        this.notificationListener();
        this.notificationOpenedListener();
    }

    public render() {
        console.log("ahihiD");
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}> {this.state.name}</Text>
                <Text style={styles.welcome}> {this.state.token}</Text>
            </View>
        );
    }

    public async createNotificationListeners() {
        /*
        * Triggered when a particular notification has been received in foreground
        * */
        this.notificationListener();

        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        this.notificationOpenedListener();

        /*
        * If your app is closed, you can check if it was opened
        * by a notification being clicked / tapped / opened as follows:
        * */
        this.notificationOpen();
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener();
    }

    public notificationListener() {
        firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            this.showAlert(title, "notificationListener");
        });
    }

    public notificationOpenedListener() {
        firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body } = notificationOpen.notification;
            this.showAlert(title, "notificationOpenedListener");
        });
    }

    public messageListener() {
        firebase.messaging().onMessage((message) => {
            // process data message
            console.log(JSON.stringify(message));
            this.showAlert("title", "messageListener");
        });
    }

    public async notificationOpen() {
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;
            this.showAlert(title, "notificationOpen");
        }
    }

    public showAlert(title: string, body: string) {
        Alert.alert(
            title, body,
            [
                { text: "OK", onPress: () => console.log("OK Pressed") },
            ],
            { cancelable: false },
        );
    }

    public async checkPermission() {
        const enable = await firebase.messaging().hasPermission();
        if (enable) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    public async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            this.getToken();
        } catch (error) {
            console.log(error);
        }
    }

    public async getToken() {
        let fcmToken = await AsyncStorage.getItem("fcmToken");
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                await AsyncStorage.setItem("fcmToken", fcmToken);
            }
        }
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF",
    },
    welcome: {
        fontSize: 20,
        textAlign: "center",
        margin: 10,
    },
});
