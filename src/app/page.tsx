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
  useMediaQuery,
} from "@mui/material";
import {
  CloudUpload,
  Receipt,
  Group,
  PieChart,
  Home as HomeIcon,
  Settings,
  ArrowForward,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

// Then in your component

// Feature card component
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
        },
        overflow: "visible",
        border: "1px solid",
        borderColor: "grey.100",
      }}
    >
      <Box sx={{ p: 3 }}>
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
              bgcolor: "primary.light",
              color: "primary.main",
              width: 50,
              height: 50,
              borderRadius: 2,
              mb: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            component="h3"
            fontWeight="600"
            gutterBottom
            sx={{ mt: 1 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

// Tech card component
const TechCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 2,
        bgcolor: "white",
        border: "1px solid",
        borderColor: "grey.200",
        transition: "transform 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Typography variant="h6" component="h3" fontWeight="600" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
};

// Navigation item component
const NavItem = ({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: active ? "primary.main" : "text.secondary",
        px: 2,
        py: 1,
        transition: "color 0.2s",
        "&:hover": {
          color: "primary.main",
        },
        cursor: "pointer",
      }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{ mt: 0.5, fontWeight: active ? 500 : 400 }}
      >
        {label}
      </Typography>
    </Box>
  );
};

const Home = () => {
  const theme = useTheme();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/trips");
  };

  const handleSeeDemo = () => {
    router.push("/demo");
  };

  return (
    <Box sx={{ width: "100%", pb: { xs: 7, sm: 0 } }}>
      {/* Hero Section with Gradient Background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #744AF6 100%)`,
          color: "white",
          py: { xs: 10, md: 15 },
          px: 3,
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
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              fontWeight="bold"
              sx={{
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                textShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              Family Expense Oracle
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{
                mb: 5,
                maxWidth: 600,
                mx: "auto",
                fontWeight: "normal",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Split travel expenses with family, track shared costs, and manage
              receipts effortlessly.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "center",
                flexDirection: { xs: "column", sm: "row" },
                maxWidth: { xs: "100%", sm: 450 },
                mx: "auto",
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
                    transform: "translateY(-2px)",
                  },
                  fontWeight: 600,
                  py: 1.5,
                  px: 4,
                  flex: { xs: "1", sm: "1 1 auto" },
                  borderRadius: 2,
                  transition: "transform 0.2s, background 0.2s",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
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
                    transform: "translateY(-2px)",
                  },
                  fontWeight: 600,
                  py: 1.35,
                  px: 4,
                  flex: { xs: "1", sm: "1 1 auto" },
                  borderRadius: 2,
                  transition: "transform 0.2s, background 0.2s",
                }}
              >
                See Demo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: 3 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            fontWeight="bold"
            sx={{
              mb: { xs: 5, md: 8 },
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                width: "60px",
                height: "4px",
                backgroundColor: theme.palette.primary.main,
                bottom: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                borderRadius: "2px",
              },
            }}
          >
            How It Works
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<CloudUpload sx={{ fontSize: 28 }} />}
                title="Upload Receipts"
                description="Snap a photo of your receipts or manually enter expenses with our easy-to-use interface."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<Receipt sx={{ fontSize: 28 }} />}
                title="Smart Processing"
                description="Our AI automatically extracts expense details and identifies family member markings."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<Group sx={{ fontSize: 28 }} />}
                title="Fair Splitting"
                description="Toggle between shared expenses and individual allocations with a simple switch."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<PieChart sx={{ fontSize: 28 }} />}
                title="Clear Insights"
                description="View expenses by person, category, or date with beautiful visualizations."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Technology Section */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          px: 3,
          bgcolor: "grey.50",
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to bottom right, rgba(155,135,245,0.05), rgba(255,255,255,0))",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            fontWeight="bold"
            sx={{
              mb: { xs: 5, md: 8 },
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                width: "60px",
                height: "4px",
                backgroundColor: theme.palette.primary.main,
                bottom: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                borderRadius: "2px",
              },
            }}
          >
            Powerful Technology
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <TechCard
                title="AI-Powered"
                description="OCR and entity recognition to process receipts intelligently"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TechCard
                title="Secure Storage"
                description="Cloud-based storage for your expense data and receipts"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TechCard
                title="Flexible Tracking"
                description="Track shared or individual expenses with ease"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mobile Navigation (fixed at bottom on mobile) */}
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
          <NavItem icon={<HomeIcon />} label="Dashboard" active />
          <NavItem icon={<CloudUpload />} label="Add" />
          <NavItem icon={<Settings />} label="Settings" />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
