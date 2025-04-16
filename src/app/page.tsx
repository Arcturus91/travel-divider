"use client";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  Chip,
  Avatar,
  Stack,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  Fab,
  Tooltip,
} from "@mui/material";
import Image from "next/image";
import {
  CloudUpload,
  Receipt,
  Group,
  PieChart,
  CurrencyExchange,
  Home as HomeIcon,
  Settings,
  ArrowForward,
  Flight,
  CreditCard,
  Savings,
  InsertPhoto,
  Dashboard,
  Add,
  ArrowUpward,
  AttachMoney,
  ReceiptLong,
  Paid,
  Wallet,
  CreditScore,
  VerifiedUser,
  LockOutlined,
  SpeedOutlined,
  DevicesOutlined,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Feature card component
const FeatureCard = ({
  icon,
  title,
  description,
  color = "primary.light",
  iconColor = "primary.main",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  iconColor?: string;
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
        },
        overflow: "visible",
        border: "1px solid",
        borderColor: "grey.100",
        position: "relative",
      }}
    >
      <Box sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: color,
              color: iconColor,
              width: 60,
              height: 60,
              borderRadius: 3,
              mb: 3,
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "rotate(5deg) scale(1.05)",
              },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h5"
            component="h3"
            fontWeight="600"
            gutterBottom
            sx={{ 
              mt: 1,
              fontSize: { xs: "1.25rem", md: "1.5rem" }
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              lineHeight: 1.7,
              fontSize: { xs: "0.9rem", md: "1rem" } 
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

// Testimonial Card Component
const TestimonialCard = ({
  quote,
  name,
  role,
  avatarSrc,
}: {
  quote: string;
  name: string;
  role: string;
  avatarSrc: string;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        height: "100%",
        borderRadius: 3,
        bgcolor: "white",
        border: "1px solid",
        borderColor: "grey.200",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 3,
          fontStyle: "italic",
          lineHeight: 1.8,
          flex: 1,
          position: "relative",
          "&:before": {
            content: '"\\201C"',
            fontSize: "4rem",
            position: "absolute",
            left: -15,
            top: -20,
            color: "primary.light",
            opacity: 0.3,
          },
        }}
      >
        {quote}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <Avatar
          src={avatarSrc}
          alt={name}
          sx={{ width: 48, height: 48, mr: 2, border: "2px solid", borderColor: "primary.light" }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {role}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Statistics item component
const StatItem = ({ 
  value, 
  label, 
  icon 
}: { 
  value: string; 
  label: string; 
  icon: React.ReactNode 
}) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        p: 3,
        borderRadius: 3,
        bgcolor: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "center",
          "& svg": {
            fontSize: "2.5rem",
            color: "primary.main",
          },
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h4"
        component="p"
        fontWeight="bold"
        color="primary.main"
        sx={{ mb: 1 }}
      >
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
};

// Navigation item component
const NavItem = ({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: active ? "primary.main" : "text.secondary",
        px: 2,
        py: 1,
        transition: "all 0.2s ease",
        "&:hover": {
          color: "primary.main",
          transform: "translateY(-2px)",
        },
        cursor: "pointer",
      }}
    >
      <Box sx={{ "& svg": { fontSize: "1.5rem" } }}>{icon}</Box>
      <Typography
        variant="caption"
        sx={{ mt: 0.5, fontWeight: active ? 600 : 400 }}
      >
        {label}
      </Typography>
    </Box>
  );
};

const Home = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleGetStarted = () => {
    router.push("/trips");
  };

  const handleSeeDemo = () => {
    router.push("/demo");
  };

  return (
    <Box sx={{ width: "100%", pb: { xs: 7, sm: 0 }, overflow: 'hidden' }}>
      {/* Header/Navigation */}
      <AppBar 
        position="fixed" 
        color="transparent" 
        elevation={0}
        sx={{ 
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottom: "1px solid",
          borderColor: "rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <AttachMoney sx={{ color: 'primary.main', fontSize: '2rem', mr: 1 }} />
              <Typography 
                variant="h6" 
                component="div" 
                fontWeight="bold"
                color="text.primary"
              >
                Travel Divider
              </Typography>
            </Box>
            
            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
              <Button color="inherit">Features</Button>
              <Button color="inherit">Pricing</Button>
              <Button color="inherit">Support</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleGetStarted}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              >
                Get Started
              </Button>
            </Box>
            
            {/* Mobile Menu Button */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <IconButton edge="end" color="primary" aria-label="menu">
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Spacer for fixed AppBar */}
      <Toolbar />
      
      {/* Hero Section with Gradient Background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #744AF6 100%)`,
          color: "white",
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 150%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)",
          },
        }}
      >
        {/* Decorative Elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '10%', 
            left: '5%', 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)', 
            filter: 'blur(40px)'
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '15%', 
            right: '10%', 
            width: '200px', 
            height: '200px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)', 
            filter: 'blur(60px)'
          }} 
        />
        
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Chip 
                  label="Expense Management Made Simple" 
                  color="secondary" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    fontSize: '0.875rem',
                    py: 1,
                    px: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '& .MuiChip-label': { px: 1 }
                  }} 
                />
                <Typography
                  variant="h1"
                  gutterBottom
                  fontWeight="bold"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "2.75rem", sm: "3.5rem", md: "4rem" },
                    lineHeight: 1.2,
                    textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Split Expenses <br />
                  Without The Drama
                </Typography>
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    mb: 6,
                    maxWidth: 500,
                    mx: { xs: 'auto', md: 0 },
                    fontWeight: "normal",
                    opacity: 0.9,
                    lineHeight: 1.8,
                  }}
                >
                  Say goodbye to awkward money conversations. Our smart expense tracker 
                  makes splitting travel costs with family and friends effortless and fair.
                </Typography>

                <Stack 
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  sx={{ 
                    maxWidth: { xs: '100%', sm: 450 },
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        transform: "translateY(-3px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                      },
                      fontWeight: 600,
                      py: 1.75,
                      px: 4,
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleSeeDemo}
                    sx={{
                      borderColor: "white",
                      borderWidth: 2,
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        transform: "translateY(-3px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      },
                      fontWeight: 600,
                      py: 1.6,
                      px: 4,
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '500px',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                  transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(-2deg) rotateX(2deg) translateY(-10px)',
                  }
                }}
              >
                {/* App mockup/dashboard image would go here */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.25)',
                    mb: 3
                  }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: '#FF6B6B',
                      mr: 1
                    }} />
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: '#FFD93D',
                      mr: 1
                    }} />
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: '#6BCB77',
                      mr: 2
                    }} />
                    <Box sx={{ 
                      flex: 1, 
                      height: 10, 
                      borderRadius: 5, 
                      bgcolor: 'rgba(255,255,255,0.5)' 
                    }} />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3
                  }}>
                    <Box sx={{ flex: 3, pr: 2 }}>
                      <Typography variant="h6" color="white" fontWeight="bold" sx={{ mb: 2 }}>
                        Trip to Paris
                      </Typography>
                      <Box sx={{ 
                        height: 20, 
                        width: '80%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        mb: 1.5
                      }} />
                      <Box sx={{ 
                        height: 20, 
                        width: '60%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.2)',
                      }} />
                    </Box>
                    <Box sx={{ 
                      flex: 2,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      p: 2
                    }}>
                      <Box sx={{ 
                        height: 15, 
                        width: '90%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        mb: 1.5
                      }} />
                      <Box sx={{ 
                        height: 30, 
                        width: '100%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.4)',
                        mb: 1
                      }} />
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    gap: 2,
                    mb: 3
                  }}>
                    <Box sx={{ 
                      flex: 1,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.25)',
                        mb: 1.5
                      }}>
                        <CreditCard sx={{ color: 'white', fontSize: '1.5rem' }} />
                      </Box>
                      <Box sx={{ 
                        height: 12, 
                        width: '70%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        mb: 1
                      }} />
                      <Box sx={{ 
                        height: 20, 
                        width: '90%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.4)',
                      }} />
                    </Box>
                    <Box sx={{ 
                      flex: 1,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: 3,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.25)',
                        mb: 1.5
                      }}>
                        <ReceiptLong sx={{ color: 'white', fontSize: '1.5rem' }} />
                      </Box>
                      <Box sx={{ 
                        height: 12, 
                        width: '70%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        mb: 1
                      }} />
                      <Box sx={{ 
                        height: 20, 
                        width: '90%',
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.4)',
                      }} />
                    </Box>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ 
                      height: 15, 
                      width: '30%',
                      borderRadius: 1,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      mb: 2
                    }} />
                    <Box sx={{ 
                      display: 'flex',
                      gap: 2,
                      mb: 2
                    }}>
                      <Box sx={{ 
                        flex: 1,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                      }} />
                      <Box sx={{ 
                        flex: 1,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                      }} />
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      gap: 2,
                    }}>
                      <Box sx={{ 
                        flex: 1,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }} />
                      <Box sx={{ 
                        flex: 1,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                      }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Key Stats Section */}
      <Box sx={{ 
        py: 5, 
        bgcolor: 'white', 
        transform: 'translateY(-60px)', 
        borderRadius: { xs: '30px 30px 0 0', md: '50px 50px 0 0' },
        boxShadow: '0 -10px 50px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <StatItem 
                value="2M+" 
                label="Expenses Tracked" 
                icon={<Paid />} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatItem 
                value="98%" 
                label="Satisfied Users" 
                icon={<Wallet />} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatItem 
                value="$500M" 
                label="Expenses Processed" 
                icon={<CreditScore />} 
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 }, 
        px: 3, 
        bgcolor: 'white',
        position: 'relative',
        zIndex: 0,
        borderTop: '1px solid',
        borderColor: 'rgba(0,0,0,0.03)',
        mt: -1, // Slight overlap to prevent gap
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Chip 
              label="SIMPLE PROCESS" 
              color="primary" 
              size="small"
              sx={{ mb: 2, fontWeight: 'bold' }} 
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              sx={{
                mb: 3,
                fontSize: { xs: "2rem", md: "2.75rem" },
              }}
            >
              How Travel Divider Works
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: "auto",
                lineHeight: 1.8,
              }}
            >
              Our intuitive platform makes splitting travel expenses simple, fair, 
              and transparent for everyone involved.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<InsertPhoto sx={{ fontSize: 32 }} />}
                title="Capture Receipts"
                description="Take a photo of your receipts or manually enter expenses with just a few taps."
                color="rgba(46, 125, 247, 0.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<Receipt sx={{ fontSize: 32 }} />}
                title="Smart Processing"
                description="Our system automatically extracts details and categorizes your expenses."
                color="rgba(255, 158, 68, 0.1)"
                iconColor="secondary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<CurrencyExchange sx={{ fontSize: 32 }} />}
                title="Fair Division"
                description="Choose between equal splits or customize how much each person pays."
                color="rgba(76, 175, 80, 0.1)"
                iconColor="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<Group sx={{ fontSize: 32 }} />}
                title="Settle Up"
                description="See who owes what with clear breakdowns and payment summaries."
                color="rgba(3, 169, 244, 0.1)"
                iconColor="info.main"
              />
            </Grid>
          </Grid>

          <Box 
            sx={{ 
              mt: { xs: 6, md: 10 }, 
              textAlign: 'center' 
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              startIcon={<Flight />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                }
              }}
            >
              Start Your Journey
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          px: 3,
          bgcolor: 'grey.50',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 0,
          borderTop: '1px solid',
          borderColor: 'rgba(0,0,0,0.03)',
          mt: -1, // Slight overlap to prevent gap
        }}
      >
        {/* Background decorative elements */}
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(46, 125, 247, 0.08) 0%, rgba(116, 74, 246, 0.08) 100%)',
          top: '-100px',
          left: '-100px',
          zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(46, 125, 247, 0.05) 0%, rgba(116, 74, 246, 0.05) 100%)',
          bottom: '-150px',
          right: '-150px',
          zIndex: 0,
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Chip 
              label="POWERFUL FEATURES" 
              color="primary" 
              size="small"
              sx={{ mb: 2, fontWeight: 'bold' }} 
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              sx={{
                mb: 3,
                fontSize: { xs: "2rem", md: "2.75rem" },
              }}
            >
              Everything You Need
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: "auto",
                lineHeight: 1.8,
              }}
            >
              Our platform is packed with tools to make expense tracking 
              and sharing as painless as possible.
            </Typography>
          </Box>

          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
              <Stack spacing={4}>
                <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      bgcolor: 'primary.light',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <VerifiedUser fontSize="large" />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Secure & Private
                  </Typography>
                  <Typography color="text.secondary">
                    Your financial data is encrypted and never shared with third parties.
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'secondary.main',
                      bgcolor: 'secondary.light',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <LockOutlined fontSize="large" />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Cloud Storage
                  </Typography>
                  <Typography color="text.secondary">
                    Access your expenses from anywhere, anytime with cloud-based storage.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'relative',
                  width: '280px',
                  height: '560px',
                  borderRadius: 5,
                  overflow: 'hidden',
                  border: '12px solid #333',
                  boxShadow: '0 32px 64px rgba(0,0,0,0.2)',
                }}
              >
                {/* Phone mockup content */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ 
                    height: '70px', 
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    color: 'white',
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Travel Divider
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1, p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Paris Trip - June 2023
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex',
                      bgcolor: 'grey.100',
                      p: 1.5,
                      borderRadius: 2,
                      mt: 2,
                      mb: 1,
                      alignItems: 'center'
                    }}>
                      <Box sx={{ 
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mr: 1.5
                      }}>
                        <Flight fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Flight to Paris
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold">
                          $350.00
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Chip size="small" label="Split" />
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      bgcolor: 'grey.100',
                      p: 1.5,
                      borderRadius: 2,
                      mb: 1,
                      alignItems: 'center'
                    }}>
                      <Box sx={{ 
                        bgcolor: 'secondary.main',
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mr: 1.5
                      }}>
                        <CreditCard fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Hotel Accommodation
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold">
                          $780.00
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Chip size="small" label="Split" />
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      bgcolor: 'grey.100',
                      p: 1.5,
                      borderRadius: 2,
                      mb: 3,
                      alignItems: 'center'
                    }}>
                      <Box sx={{ 
                        bgcolor: 'info.main',
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mr: 1.5
                      }}>
                        <Receipt fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Dinner at Le Bistro
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold">
                          $120.00
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Chip size="small" label="Split" />
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Summary
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <Typography variant="body2">John owes:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">$320.00</Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <Typography variant="body2">Sarah owes:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">$280.00</Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <Typography variant="body2">Mike owes:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">$250.00</Typography>
                    </Box>
                    
                    <Box sx={{ 
                      bgcolor: 'primary.light',
                      borderRadius: 2,
                      p: 1.5,
                      mt: 3
                    }}>
                      <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                        All expenses are split evenly
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    height: '60px',
                    borderTop: '1px solid',
                    borderColor: 'grey.200',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    px: 1.5
                  }}>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'primary.main'
                    }}>
                      <Dashboard fontSize="small" />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Home</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'text.disabled'
                    }}>
                      <Add fontSize="small" />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Add</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'text.disabled'
                    }}>
                      <Settings fontSize="small" />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Settings</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Stack spacing={4}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'success.main',
                      bgcolor: 'success.light',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <SpeedOutlined fontSize="large" />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Real-time Updates
                  </Typography>
                  <Typography color="text.secondary">
                    Changes sync instantly so everyone stays on the same page.
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'info.main',
                      bgcolor: 'info.light',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <DevicesOutlined fontSize="large" />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Works Everywhere
                  </Typography>
                  <Typography color="text.secondary">
                    Available on web and mobile, online or offline. Your data syncs when you reconnect.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonial Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        px: 3, 
        bgcolor: 'white',
        position: 'relative',
        zIndex: 0,
        borderTop: '1px solid',
        borderColor: 'rgba(0,0,0,0.03)',
        mt: -1, // Slight overlap to prevent gap
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Chip 
              label="SUCCESS STORIES" 
              color="secondary" 
              size="small"
              sx={{ mb: 2, fontWeight: 'bold' }} 
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              sx={{
                mb: 3,
                fontSize: { xs: "2rem", md: "2.75rem" },
              }}
            >
              What Our Users Say
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: "auto",
                lineHeight: 1.8,
              }}
            >
              Thousands of travelers are using Travel Divider to make their trips more enjoyable.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <TestimonialCard
                quote="Travel Divider saved our friendship! No more awkward conversations about who owes what. We used it on our trip to Italy and it made everything so much easier."
                name="Sarah Johnson"
                role="Family Traveler"
                avatarSrc="https://randomuser.me/api/portraits/women/44.jpg"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TestimonialCard
                quote="The receipt scanning feature is incredible. I just snap a photo and it automatically extracts all the information. Saved me hours of manual input during our business trip."
                name="Michael Chen"
                role="Business Traveler"
                avatarSrc="https://randomuser.me/api/portraits/men/32.jpg"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TestimonialCard
                quote="I organized a trip with 8 friends and was dreading the expense tracking. Travel Divider made it so simple that I actually enjoyed managing our budget!"
                name="Emily Rodriguez"
                role="Group Organizer"
                avatarSrc="https://randomuser.me/api/portraits/women/68.jpg"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: "white",
          position: "relative",
          textAlign: "center",
          overflow: "hidden",
          zIndex: 0,
          borderTop: '1px solid',
          borderColor: 'rgba(0,0,0,0.03)',
          mt: -1, // Slight overlap to prevent gap
        }}
      >
        {/* Decorative Elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '20%', 
            right: '10%', 
            width: '200px', 
            height: '200px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)', 
            filter: 'blur(50px)'
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '10%', 
            left: '5%', 
            width: '300px', 
            height: '300px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.05)', 
            filter: 'blur(80px)'
          }} 
        />
        
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h2"
            component="h2"
            fontWeight="bold"
            sx={{
              mb: 3,
              fontSize: { xs: "2rem", md: "3rem" },
              textShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            Ready to Simplify Your Travel Expenses?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              mb: 6,
              maxWidth: 700,
              mx: "auto",
              opacity: 0.9,
              lineHeight: 1.8,
            }}
          >
            Join thousands of travelers who have transformed how they manage group expenses.
            Start your journey with Travel Divider today.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              bgcolor: "white",
              color: theme.palette.primary.main,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.9)",
                transform: "translateY(-3px)",
              },
              fontWeight: 600,
              py: 1.75,
              px: 5,
              borderRadius: 2,
              transition: "all 0.3s ease",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              fontSize: "1.1rem"
            }}
          >
            Get Started — It's Free
          </Button>
          
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              opacity: 0.8,
            }}
          >
            No credit card required. Start for free and upgrade when you need.
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          px: 3,
          bgcolor: "grey.900",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AttachMoney sx={{ fontSize: '2rem', mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  Travel Divider
                </Typography>
              </Box>
              <Typography variant="body2" color="grey.400" sx={{ mb: 3, maxWidth: 300 }}>
                The smart way to track, manage, and split travel expenses with friends and family.
              </Typography>
              <Typography variant="caption" color="grey.500">
                © {new Date().getFullYear()} Travel Divider. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Product
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Features
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Pricing
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Testimonials
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  FAQ
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  About Us
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Blog
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Careers
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Contact
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Support
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Help Center
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Documentation
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Privacy Policy
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Terms of Service
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Connect
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Twitter
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Facebook
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Instagram
                </Typography>
                <Typography variant="body2" color="grey.400" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  LinkedIn
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box
        sx={{
          display: { sm: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "grey.200",
          zIndex: 1000,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            py: 1,
          }}
        >
          <NavItem icon={<HomeIcon />} label="Home" active onClick={() => {}} />
          <NavItem icon={<Flight />} label="Trips" onClick={handleGetStarted} />
          <NavItem icon={<Settings />} label="Settings" onClick={() => {}} />
        </Box>
      </Box>
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab 
          color="primary" 
          size="small" 
          aria-label="scroll back to top"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 70, sm: 30 },
            right: 30,
            zIndex: 1000,
          }}
        >
          <ArrowUpward />
        </Fab>
      )}
    </Box>
  );
};

export default Home;
