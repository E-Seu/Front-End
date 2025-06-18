export const menuConfig = {
  admin: [
    { label: 'Dashboard', icon: 'view-dashboard', route: 'AdminDashboard' },
    { label: 'Users', icon: 'account-group', route: 'UserList' },
    { label: 'Settings', icon: 'cog', route: 'AdminSettings' },
  ],
  user: [
    { label: 'Home', icon: 'home', route: 'UserHome' },
    { label: 'Profile', icon: 'account', route: 'UserProfile' },
    { label: 'Settings', icon: 'cog-outline', route: 'UserSettings' },
  ],
  guest: [
    { label: 'Home', icon: 'home-outline', route: 'GuestHome' },
    { label: 'Login', icon: 'login', route: 'Login' },
    { label: 'Help', icon: 'help-circle-outline', route: 'Help' },
  ]
};
