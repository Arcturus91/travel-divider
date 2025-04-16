"use client";

import { Box, Container, Typography, Divider } from '@mui/material';
import PageTitle from '@/components/PageTitle';

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container maxWidth="lg">
      <PageTitle title="My Trips" />
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        {children}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Travel Divider. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
}