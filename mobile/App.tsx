import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './src/screens/HomeScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import MaterialViewScreen from './src/screens/MaterialViewScreen';

const Stack = createStackNavigator();

const API_BASE_URL = 'http://localhost:8000/api'; // Change to your backend URL

export { API_BASE_URL };

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'English Learning Platform' }}
          />
          <Stack.Screen 
            name="CourseDetail" 
            component={CourseDetailScreen}
            options={{ title: 'Course Details' }}
          />
          <Stack.Screen 
            name="MaterialView" 
            component={MaterialViewScreen}
            options={{ title: 'Material' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
