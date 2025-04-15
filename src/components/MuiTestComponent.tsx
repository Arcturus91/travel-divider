'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Grid,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccountCircle,
  AttachMoney,
  Receipt,
} from '@mui/icons-material';

export default function MuiTestComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Material UI Test Component
      </Typography>
      
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        This component demonstrates various Material UI elements with our custom theme
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<AccountCircle />} label="Profile" />
          <Tab icon={<AttachMoney />} label="Expenses" />
          <Tab icon={<Receipt />} label="Summary" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Record New Expense
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
                <TextField 
                  label="Description" 
                  fullWidth 
                  placeholder="E.g., Dinner at Restaurant"
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      label="Amount" 
                      type="number"
                      fullWidth 
                      placeholder="0.00"
                      InputProps={{
                        startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>$</Box>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      label="Date" 
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </Grid>
                </Grid>

                <TextField 
                  label="Paid By" 
                  select
                  fullWidth 
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select a person</option>
                  <option value="1">You</option>
                  <option value="2">Alex</option>
                  <option value="3">Sam</option>
                </TextField>
              </Box>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                sx={{ mr: 1 }}
              >
                Add Expense
              </Button>
              <Button variant="outlined" color="secondary">
                Cancel
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Expenses
                </Typography>
                <Button 
                  size="small" 
                  color="primary"
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {[
                { id: 1, desc: 'Hotel Accommodation', amount: 240.50, date: '2025-05-10', paidBy: 'You' },
                { id: 2, desc: 'Taxi from Airport', amount: 35.75, date: '2025-05-09', paidBy: 'Alex' },
                { id: 3, desc: 'Dinner at Restaurant', amount: 85.20, date: '2025-05-09', paidBy: 'Sam' },
              ].map((expense) => (
                <Paper 
                  key={expense.id}
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: theme.palette.grey[50],
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{expense.desc}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(expense.date).toLocaleDateString()} • Paid by {expense.paidBy}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="subtitle1" 
                      color="secondary.main" 
                      sx={{ fontWeight: 500, mr: 1 }}
                    >
                      ${expense.amount.toFixed(2)}
                    </Typography>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          This is just a demonstration of Material UI components with our custom travel-themed design.
        </Typography>
      </Box>
    </Box>
  );
}