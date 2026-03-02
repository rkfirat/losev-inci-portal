import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { DashboardScreen } from '../screens/App/DashboardScreen';
import { CoalitionScreen } from '../screens/App/CoalitionScreen';
import { LogHoursScreen } from '../screens/Volunteer/LogHoursScreen';
import { VolunteerHoursScreen } from '../screens/Volunteer/VolunteerHoursScreen';
import { BadgesScreen } from '../screens/Badges/BadgesScreen';
import { BadgeDetailScreen } from '../screens/Badges/BadgeDetailScreen';
import { EventsScreen } from '../screens/Events/EventsScreen';
import { EventDetailScreen } from '../screens/Events/EventDetailScreen';
import { LeaderboardScreen } from '../screens/Leaderboard/LeaderboardScreen';
import { CoordinatorScreen } from '../screens/Coordinator/CoordinatorScreen';
import { AdminVolunteersScreen } from '../screens/Admin/AdminVolunteersScreen';
import { AdminEventsScreen } from '../screens/Admin/AdminEventsScreen';
import { AdminReportsScreen } from '../screens/Admin/AdminReportsScreen';
import { AdminAnnouncementsScreen } from '../screens/Admin/AdminAnnouncementsScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { NotificationService } from '../services/notification.service';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated, user, isLoading, setLoading } = useAuthStore();
  const { isMobile } = useBreakpoint();
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Zustand persist hydration hook workaround
    const unsub = useAuthStore.persist.onFinishHydration(() => {
        setLoading(false);
        setIsRendered(true);
    });
    
    if (useAuthStore.persist.hasHydrated()) {
       setLoading(false);
       setIsRendered(true);
    } else {
       setIsRendered(true);
    }

    return () => unsub();
  }, []);

  // Handle Notifications
  useEffect(() => {
    if (isAuthenticated && Platform.OS !== 'web') {
      NotificationService.registerForPushNotificationsAsync().then(token => {
        if (token) {
          NotificationService.updatePushTokenOnServer(token);
        }
      });
    }
  }, [isAuthenticated]);

  if (!isRendered || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E05A47" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            {isMobile ? (
              <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            ) : (
              <>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Events" component={EventsScreen} />
                <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
                <Stack.Screen name="Coalition" component={CoalitionScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                
                <Stack.Screen name="VolunteerHours" component={VolunteerHoursScreen} />
                <Stack.Screen name="Badges" component={BadgesScreen} />
                
                {(user?.role === 'ADMIN' || user?.role === 'COORDINATOR') && (
                  <>
                    <Stack.Screen name="Coordinator" component={CoordinatorScreen} />
                    <Stack.Screen name="AdminVolunteers" component={AdminVolunteersScreen} />
                    <Stack.Screen name="AdminEvents" component={AdminEventsScreen} />
                    <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
                    <Stack.Screen name="AdminAnnouncements" component={AdminAnnouncementsScreen} />
                  </>
                )}
              </>
            )}
            {/* Common Stack Screens (Accessible from both) */}
            <Stack.Screen name="LogHours" component={LogHoursScreen} />
            <Stack.Screen name="BadgeDetail" component={BadgeDetailScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
