import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#128c7e', // primary
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8', // slate-500 / slate-400
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff', // slate-900 / white
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(18, 140, 126, 0.1)' : 'rgba(18, 140, 126, 0.1)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => <MaterialIcons name="confirmation-number" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="knowledge-base"
        options={{
          title: 'KB',
          tabBarIcon: ({ color }) => <MaterialIcons name="menu-book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <MaterialIcons name="group" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="account-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
