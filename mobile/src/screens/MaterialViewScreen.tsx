import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

export default function MaterialViewScreen({ route }: any) {
  const { material } = route.params;

  return (
    <View style={styles.container}>
      <Text>Material Viewer</Text>
      <Text>{material.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
