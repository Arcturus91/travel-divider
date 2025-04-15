import Link from "next/link";
import MuiTestComponent from "@/components/MuiTestComponent";
import { Box, Button, Container, Typography, Paper, Divider } from '@mui/material';

export default function Home() {
  return (
    <Box>
      <Paper 
        elevation={0}
        sx={{ 
          backgroundImage: 'linear-gradient(to right, #2E7DF7, #744AF6)',
          color: 'white',
          py: 8,
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Travel Divider
          </Typography>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ mb: 4, maxWidth: 600 }}
          >
            Split travel expenses with friends and family, hassle-free.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Button 
              component={Link}
              href="/trips"
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                px: 4
              }}
            >
              Get Started
            </Button>
            <Button 
              component={Link}
              href="/demo"
              variant="outlined"
              size="large"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                },
                px: 4
              }}
            >
              See Demo
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ mt: 4, mb: 2 }}
        >
          Material UI Demo
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
        >
          Below is a demonstration of Material UI components with our custom theme designed for the Travel Divider app.
        </Typography>

        <MuiTestComponent />
        
        <Divider sx={{ my: 6 }} />
        
        <Box component="footer" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Travel Divider. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}