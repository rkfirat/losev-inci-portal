import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

// Profile stack (nested inside Profile tab)
export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  AdminUsers: undefined;
};

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  BottomTabScreenProps<TabParamList>
>;

// Hours stack (nested inside Hours tab)
export type HoursStackParamList = {
  HoursMain: undefined;
  AddHour: undefined;
};

export type HoursStackScreenProps<T extends keyof HoursStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HoursStackParamList, T>,
  BottomTabScreenProps<TabParamList>
>;

// Events stack (nested inside Events tab)
export type EventsStackParamList = {
  EventsMain: undefined;
  CreateEvent: undefined;
  QRScanner: undefined;
};

export type EventsStackScreenProps<T extends keyof EventsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<EventsStackParamList, T>,
  BottomTabScreenProps<TabParamList>
>;

// Main tab
export type TabParamList = {
  Dashboard: undefined;
  Hours: NavigatorScreenParams<HoursStackParamList>;
  Leaderboard: undefined;
  Events: NavigatorScreenParams<EventsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  AdminUsers: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<TabParamList, T>;
