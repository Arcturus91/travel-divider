'use client';

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

// Page titles for each route
const pageTitles: { [key: string]: string } = {
  '/': 'Home',
  '/trips': 'My Trips',
  '/trips/new-expense': 'New Expense',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

export default function Navigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get current page title based on route
  const pageTitle = pageTitles[pathname] || 'Travel Divider';

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerItems = [
    { text: 'Home', icon: <HomeIcon />, href: '/' },
    { text: 'My Trips', icon: <ReceiptIcon />, href: '/trips' },
    { text: 'Profile', icon: <PersonIcon />, href: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, href: '/settings' },
  ];

  return (
    <>
      {/* Header AppBar */}
      <AppBar position="fixed" color="primary" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2, minWidth: 44, minHeight: 44 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {pageTitle}
            </Typography>
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  component={Link}
                  href="/trips/new-expense"
                  startIcon={<AddIcon />}
                >
                  New Expense
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Side Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Travel Divider</Typography>
            <Typography variant="body2">Split expenses easily</Typography>
          </Box>
          <Divider />
          <List>
            {drawerItems.map((item) => (
              <ListItem 
                key={item.text} 
                component={Link} 
                href={item.href}
                sx={{ 
                  color: pathname === item.href ? 'primary.main' : 'text.primary',
                  bgcolor: pathname === item.href ? 'action.selected' : 'transparent',
                  minHeight: 48,
                }}
              >
                <ListItemIcon sx={{ 
                  color: pathname === item.href ? 'primary.main' : 'text.secondary',
                  minWidth: 44,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: theme.zIndex.appBar
          }} 
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={
              pathname === '/trips' ? 0 :
              pathname === '/trips/new-expense' ? 1 :
              pathname === '/settings' ? 2 : 0
            }
          >
            <BottomNavigationAction 
              label="Dashboard" 
              icon={<DashboardIcon />} 
              component={Link}
              href="/trips"
              sx={{ minWidth: 44, minHeight: 56 }}
            />
            <BottomNavigationAction 
              label="Add" 
              icon={<AddIcon />} 
              component={Link}
              href="/trips/new-expense"
              sx={{ minWidth: 44, minHeight: 56 }}
            />
            <BottomNavigationAction 
              label="Settings" 
              icon={<SettingsIcon />} 
              component={Link}
              href="/settings"
              sx={{ minWidth: 44, minHeight: 56 }}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Toolbar placeholder to push content below the AppBar */}
      <Toolbar />
      
      {/* Bottom margin for mobile to account for bottom navigation */}
      {isMobile && <Box sx={{ mb: 7 }} />}
    </>
  );
}