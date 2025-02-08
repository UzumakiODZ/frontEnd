import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const ChatUi = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Chat UI</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    text: {
        fontSize: 18,
        color: '#343a40',
    },
});

export default ChatUi;
