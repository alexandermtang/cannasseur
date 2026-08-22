import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Log } from './log';

export type AuthStackParamList = {
  SignUpLogin: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Me: undefined;
  LogNewSession: { log?: Log } | undefined;
  SubmitLog: { log?: Log } | undefined;
  ViewLog: { log: Log };
};

export type AuthScreenProps<RouteName extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  RouteName
>;

export type AppScreenProps<RouteName extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  RouteName
>;
