export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  NewWatch: undefined;
  WatchDetail: { watchId: string };
  AddEvent: { watchId: string };
  PublicPassport: { publicId: string };
};
