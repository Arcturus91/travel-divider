'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Tabs, 
  Tab, 
  Divider, 
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import PageTitle from '@/components/PageTitle';
import FamilyMembersList from '@/components/settings/FamilyMembersList';
import { FamilyMember } from '@/models/types';
import { 
  getFamilyMembers, 
  addFamilyMember, 
  updateFamilyMember, 
  removeFamilyMember 
} from '@/lib/localStorage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

export default function SettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load family members from localStorage on component mount
  useEffect(() => {
    setFamilyMembers(getFamilyMembers());
  }, []);

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddMember = (member: FamilyMember) => {
    addFamilyMember(member);
    setFamilyMembers(getFamilyMembers());
    setNotification({
      open: true,
      message: `${member.name} has been added`,
      severity: 'success',
    });
  };

  const handleUpdateMember = (member: FamilyMember) => {
    updateFamilyMember(member);
    setFamilyMembers(getFamilyMembers());
    setNotification({
      open: true,
      message: `${member.name} has been updated`,
      severity: 'success',
    });
  };

  const handleDeleteMember = (id: string) => {
    const memberName = familyMembers.find(m => m.id === id)?.name || 'Member';
    removeFamilyMember(id);
    setFamilyMembers(getFamilyMembers());
    setNotification({
      open: true,
      message: `${memberName} has been removed`,
      severity: 'info',
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="md">
      <PageTitle title="Settings" />
      
      <Paper 
        elevation={1} 
        sx={{
          overflow: 'hidden', 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: 1
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleChangeTab}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : undefined}
            allowScrollButtonsMobile={isMobile}
            aria-label="settings tabs"
          >
            <Tab label="Family Members" {...a11yProps(0)} />
            <Tab label="Preferences" {...a11yProps(1)} />
            <Tab label="Account" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <TabPanel value={tabValue} index={0}>
            <FamilyMembersList
              members={familyMembers}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Paper 
              elevation={0} 
              variant="outlined"
              sx={{ p: 3, bgcolor: 'background.default' }}
            >
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="info">
                Preferences settings will be available in a future update.
              </Alert>
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Paper 
              elevation={0} 
              variant="outlined"
              sx={{ p: 3, bgcolor: 'background.default' }}
            >
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="info">
                Account settings will be available in a future update.
              </Alert>
            </Paper>
          </TabPanel>
        </Box>
      </Paper>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}