"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  getExpenses,
  updateExpense,
  deleteExpense,
  Expense,
} from "@/lib/aws/api";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Switch,
  FormControlLabel,
  IconButton,
  Paper,
  Chip,
  Stack,
  Avatar,
  Fade,
  AppBar,
  Toolbar,
  Fab,
  Tooltip,
  Tab,
  Tabs,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem as MenuItemComponent,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  DeleteOutlined,
  EditOutlined,
  ReceiptOutlined,
  AddOutlined,
  FilterListOutlined,
  SortOutlined,
  SearchOutlined,
  MoreVertOutlined,
  MenuOutlined,
  ArrowUpward,
  CreditCardOutlined,
  AccountBalanceWalletOutlined,
  CalendarTodayOutlined,
  GroupOutlined,
  ViewListOutlined,
  ViewModuleOutlined,
  ArrowDropDown,
  AttachMoney,
  HomeOutlined,
  PersonOutlineOutlined,
  SettingsOutlined,
  FormatListBulletedOutlined,
  DownloadOutlined,
  Delete as DeleteIcon,
} from "@mui/icons-material";

export default function TripsPage() {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // References for UI elements
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Main state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTab, setCurrentTab] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile);

  // Menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [expenseMenuAnchorEl, setExpenseMenuAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  // Edit expense state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editIsShared, setEditIsShared] = useState(true);
  const [editParticipants, setEditParticipants] = useState<
    Array<{ name: string; amount: string }>
  >([]);

  // Delete expense state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Handler for opening edit dialog
  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setEditDescription(expense.description);
    setEditAmount(expense.totalAmount.toString());
    setEditCurrency(expense.currency);
    setEditIsShared(expense.isShared);

    // Initialize participants from allocations
    const participants = expense.allocations.map((allocation) => ({
      name: allocation.name,
      amount: allocation.amount.toString(),
    }));
    setEditParticipants(participants);

    setEditDialogOpen(true);
  };

  // Distribute expense equally among participants
  const distributeExpenseEqually = (amountToUse?: string) => {
    // Use either the provided amount or the current edit amount
    const amount = amountToUse || editAmount;

    if (!amount || editParticipants.length === 0) return;

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount)) return;

    console.log(
      "Distributing amount:",
      totalAmount,
      "among",
      editParticipants.length,
      "participants"
    );

    const count = editParticipants.length;
    const shareAmount = (totalAmount / count).toFixed(2);

    // Calculate rounding difference to add to the first participant
    const roundingDiff = (
      totalAmount -
      parseFloat(shareAmount) * count
    ).toFixed(2);

    const newParticipants = [...editParticipants];
    newParticipants.forEach((p, i) => {
      if (i === 0) {
        p.amount = (parseFloat(shareAmount) + parseFloat(roundingDiff)).toFixed(
          2
        );
      } else {
        p.amount = shareAmount;
      }
    });

    setEditParticipants(newParticipants);
  };

  // Handle participant changes
  const handleParticipantChange = (
    index: number,
    field: "name" | "amount",
    value: string
  ) => {
    const newParticipants = [...editParticipants];

    // If changing name, capitalize the first letter of each word
    if (field === "name") {
      newParticipants[index][field] = value
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    } else {
      newParticipants[index][field] = value;
    }

    // If not a shared expense and amount is changed, recalculate remaining amount
    if (!editIsShared && field === "amount" && editAmount) {
      const totalExpense = parseFloat(editAmount);
      if (!isNaN(totalExpense)) {
        // Calculate the sum of all participant amounts except the current one
        const currentSum = newParticipants.reduce((sum, p, i) => {
          if (i === index || !p.amount) return sum;
          return sum + parseFloat(p.amount);
        }, 0);

        // Calculate the remaining amount
        const currentAmount = parseFloat(value) || 0;
        const remainingAmount = Math.max(
          0,
          totalExpense - currentSum - currentAmount
        );

        // Find the next participant or the last participant (if current is last)
        const nextIndex = index === newParticipants.length - 1 ? 0 : index + 1;

        // Skip if the next participant is the one being edited
        if (nextIndex !== index) {
          newParticipants[nextIndex].amount = remainingAmount.toFixed(2);
        }
      }
    }

    setEditParticipants(newParticipants);
  };

  // Add a new participant field
  const addParticipant = () => {
    // Add the new participant
    const newParticipants = [...editParticipants, { name: "", amount: "" }];
    setEditParticipants(newParticipants);

    // If shared expense, redistribute the amounts immediately
    // We need a slight delay to ensure state is updated
    if (editIsShared && editAmount) {
      setTimeout(() => {
        distributeExpenseEqually(editAmount);
      }, 10);
    }
  };

  // Remove a participant field
  const removeParticipant = (index: number) => {
    if (editParticipants.length > 1) {
      const newParticipants = [...editParticipants];
      newParticipants.splice(index, 1);
      setEditParticipants(newParticipants);

      // If shared expense, redistribute the amounts
      if (editIsShared && editAmount) {
        setTimeout(() => {
          distributeExpenseEqually(editAmount);
        }, 10);
      }
    }
  };

  // Handle shared expense toggle
  const handleSharedToggle = (checked: boolean) => {
    setEditIsShared(checked);

    // If checked (shared expense), distribute equally
    if (checked && editAmount) {
      distributeExpenseEqually(editAmount);
    }
  };

  // Handler for closing edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentExpense(null);
  };

  // Handler for saving edited expense
  const handleSaveExpense = async () => {
    if (!currentExpense) return;

    try {
      setLoading(true);

      // Validate form
      if (!editDescription || !editAmount) {
        throw new Error("Please fill in all required fields");
      }

      const totalAmount = parseFloat(editAmount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Validate allocations
      const validParticipants = editParticipants.filter(
        (p) => p.name && p.amount
      );
      if (validParticipants.length < 1) {
        throw new Error(
          "Please add at least one participant with name and amount"
        );
      }

      // Check if total allocations match the total amount
      const totalAllocations = validParticipants.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );

      if (Math.abs(totalAllocations - totalAmount) > 0.01) {
        throw new Error(
          `Total allocations (${totalAllocations.toFixed(
            2
          )}) must equal total amount (${totalAmount.toFixed(2)})`
        );
      }

      // Include all original expense data to maintain integrity
      // This ensures we're passing required fields like createdAt
      const updatedExpenseData = {
        ...currentExpense,
        description: editDescription,
        totalAmount: parseFloat(editAmount),
        currency: editCurrency,
        isShared: editIsShared,
        allocations: validParticipants.map((p) => ({
          name: p.name,
          amount: parseFloat(p.amount),
        })),
      };

      await updateExpense(currentExpense.expenseId, updatedExpenseData);

      // Show success message
      setSnackbarMessage("Expense updated successfully");
      setSnackbarOpen(true);

      // Refresh expenses list
      const data = await getExpenses();
      setExpenses(data);

      // Close dialog
      handleCloseEditDialog();
    } catch (err) {
      console.error("Failed to update expense:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update expense. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler for opening delete confirmation dialog
  const handleDeleteExpense = (expenseId: string) => {
    setDeleteExpenseId(expenseId);
    setDeleteDialogOpen(true);
  };

  // Handler for closing delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteExpenseId(null);
  };

  // Handler for confirming expense deletion
  const handleConfirmDelete = async () => {
    if (!deleteExpenseId) return;

    try {
      setLoading(true);

      await deleteExpense(deleteExpenseId);

      // Show success message
      setSnackbarMessage("Expense deleted successfully");
      setSnackbarOpen(true);

      // Update expenses list by removing deleted expense
      setExpenses(expenses.filter((exp) => exp.expenseId !== deleteExpenseId));

      // Close dialog
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setError("Failed to delete expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Close notification snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // UI Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const toggleFiltersExpanded = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleExpenseMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    expenseId: string
  ) => {
    setExpenseMenuAnchorEl({
      ...expenseMenuAnchorEl,
      [expenseId]: event.currentTarget,
    });
  };

  const handleExpenseMenuClose = (expenseId: string) => {
    const newState = { ...expenseMenuAnchorEl };
    newState[expenseId] = null;
    setExpenseMenuAnchorEl(newState);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      expense.allocations.some((allocation) =>
        allocation.name.toLowerCase().includes(searchValue.toLowerCase())
      )
  );

  // Focus search input
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useEffect(() => {
    async function loadExpenses() {
      try {
        setLoading(true);
        const data = await getExpenses();
        setExpenses(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load expenses:", err);
        setError("Failed to load expenses. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate total expenses amount
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.totalAmount,
    0
  );

  // Calculate currency-specific totals
  const currencyTotals = expenses.reduce((acc, expense) => {
    const currency = expense.currency;
    if (!acc[currency]) {
      acc[currency] = 0;
    }
    acc[currency] += expense.totalAmount;
    return acc;
  }, {} as { [key: string]: number });

  // Get unique participant names
  const uniqueParticipants = Array.from(
    new Set(
      expenses.flatMap((expense) =>
        expense.allocations.map((allocation) => allocation.name)
      )
    )
  );

  // Calculate per-person spend
  const personTotals = uniqueParticipants.reduce((acc, name) => {
    acc[name] = expenses.reduce((sum, expense) => {
      const allocation = expense.allocations.find((a) => a.name === name);
      return sum + (allocation ? allocation.amount : 0);
    }, 0);
    return acc;
  }, {} as { [key: string]: number });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", position: "relative" }}>
      {/* Header/AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(10px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 1 }}
                onClick={() => toggleDrawer(true)}
              >
                <MenuOutlined />
              </IconButton>
            )}
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <AttachMoney
                sx={{ color: "primary.main", fontSize: "1.75rem", mr: 1 }}
              />
              <Typography
                variant="h6"
                component="div"
                fontWeight="bold"
                color="text.primary"
                sx={{ mr: 3 }}
              >
                Travel Divider
              </Typography>

              {!isMobile && (
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  aria-label="dashboard tabs"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      minWidth: 100,
                      fontWeight: 500,
                    },
                  }}
                >
                  <Tab label="All Expenses" />
                  <Tab label="Recent" />
                  <Tab label="By Person" />
                </Tabs>
              )}
            </Box>

            <Box>
              <Box
                component="form"
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  bgcolor: alpha(theme.palette.divider, 0.08),
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  "&:hover": { bgcolor: alpha(theme.palette.divider, 0.12) },
                  mr: 1,
                  width: 220,
                }}
              >
                <SearchOutlined sx={{ color: "text.secondary", mr: 1 }} />
                <TextField
                  placeholder="Search expenses..."
                  size="small"
                  variant="standard"
                  fullWidth
                  value={searchValue}
                  onChange={handleSearchChange}
                  inputRef={searchInputRef}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  sx={{
                    "& input": {
                      py: 1,
                    },
                  }}
                />
              </Box>

              {isMobile && (
                <IconButton color="primary" onClick={focusSearchInput}>
                  <SearchOutlined />
                </IconButton>
              )}

              <Button
                variant="contained"
                component={Link}
                href="/trips/new-expense"
                startIcon={<AddOutlined />}
                sx={{
                  ml: 1.5,
                  display: { xs: "none", sm: "flex" },
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(46, 125, 247, 0.2)",
                  px: 2,
                }}
              >
                New Expense
              </Button>

              {isMobile && (
                <IconButton
                  color="primary"
                  onClick={() => router.push("/trips/new-expense")}
                  sx={{ ml: 0.5 }}
                >
                  <AddOutlined />
                </IconButton>
              )}
            </Box>
          </Box>
        </Toolbar>

        {/* Mobile tabs */}
        {isMobile && (
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="mobile dashboard tabs"
            variant="fullWidth"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                py: 1,
              },
            }}
          >
            <Tab label="All" />
            <Tab label="Recent" />
            <Tab label="By Person" />
          </Tabs>
        )}
      </AppBar>

      {/* Toolbar spacer */}
      <Toolbar />
      {isMobile && <Box sx={{ height: 48 }} />}

      <Container maxWidth="lg" sx={{ pt: 3, pb: 8 }}>
        {/* Dashboard Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            pb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{ mb: 0.5 }}
            >
              Expenses Dashboard
            </Typography>
            <Typography color="text.secondary" variant="subtitle1">
              Manage and track your shared travel expenses
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Tooltip title="Filter expenses">
              <Button
                startIcon={<FilterListOutlined />}
                endIcon={<ArrowDropDown />}
                onClick={handleFilterClick}
                sx={{
                  bgcolor: filterAnchorEl
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                  borderRadius: 2,
                  px: 1.5,
                }}
              >
                Filter
              </Button>
            </Tooltip>

            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              PaperProps={{
                sx: {
                  width: 220,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  borderRadius: 2,
                  mt: 1,
                },
              }}
            >
              <MenuItemComponent>
                <ListItemText primary="All expenses" />
              </MenuItemComponent>
              <MenuItemComponent>
                <ListItemText primary="Shared expenses only" />
              </MenuItemComponent>
              <MenuItemComponent>
                <ListItemText primary="With receipt" />
              </MenuItemComponent>
              <Divider />
              <MenuItemComponent>
                <ListItemText primary="Last 7 days" />
              </MenuItemComponent>
              <MenuItemComponent>
                <ListItemText primary="Last 30 days" />
              </MenuItemComponent>
              <MenuItemComponent>
                <ListItemText primary="Custom range..." />
              </MenuItemComponent>
            </Menu>

            <Tooltip title="Sort expenses">
              <Button
                startIcon={<SortOutlined />}
                endIcon={<ArrowDropDown />}
                onClick={handleSortClick}
                sx={{
                  bgcolor: sortAnchorEl
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                  borderRadius: 2,
                  px: 1.5,
                }}
              >
                Sort
              </Button>
            </Tooltip>

            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
              PaperProps={{
                sx: {
                  width: 220,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  borderRadius: 2,
                  mt: 1,
                },
              }}
            >
              <MenuItemComponent>
                <ListItemText primary="Newest first" />
              </MenuItemComponent>
              <MenuItemComponent>
                <ListItemText primary="Oldest first" />
              </MenuItemComponent>
              <Divider />
              <MenuItemComponent>
                <ListItemText primary="Highest amount" />
              </MenuItemComponent>
              <MenuItemComponent>
                <ListItemText primary="Lowest amount" />
              </MenuItemComponent>
              <Divider />
              <MenuItemComponent>
                <ListItemText primary="A-Z" />
              </MenuItemComponent>
              <MenuItemComponent>
                <ListItemText primary="Z-A" />
              </MenuItemComponent>
            </Menu>

            <Tooltip title={viewMode === "grid" ? "List view" : "Grid view"}>
              <IconButton
                onClick={() =>
                  handleViewModeChange(viewMode === "grid" ? "list" : "grid")
                }
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {viewMode === "grid" ? (
                  <ViewListOutlined />
                ) : (
                  <ViewModuleOutlined />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Dashboard Content */}
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Cards Row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <AccountBalanceWalletOutlined />
                    </Avatar>
                    <Box sx={{ ml: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Expenses
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{ mb: 0.5 }}
                  >
                    ${totalExpenses.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {expenses.length}{" "}
                    {expenses.length === 1 ? "expense" : "expenses"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: "secondary.main",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <GroupOutlined />
                    </Avatar>
                    <Box sx={{ ml: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Team Members
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{ mb: 0.5 }}
                  >
                    {uniqueParticipants.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {uniqueParticipants.slice(0, 2).join(", ")}
                    {uniqueParticipants.length > 2 &&
                      ` +${uniqueParticipants.length - 2} more`}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: "success.main",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <CalendarTodayOutlined />
                    </Avatar>
                    <Box sx={{ ml: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Last 7 Days
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{ mb: 0.5 }}
                  >
                    $
                    {expenses
                      .filter(
                        (e) =>
                          new Date(e.createdAt) >
                          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      )
                      .reduce((sum, e) => sum + e.totalAmount, 0)
                      .toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {
                      expenses.filter(
                        (e) =>
                          new Date(e.createdAt) >
                          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length
                    }{" "}
                    expenses this week
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Expenses List */}
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 10,
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <CircularProgress size={48} thickness={4} />
                <Typography variant="subtitle1" color="text.secondary">
                  Loading expenses...
                </Typography>
              </Box>
            ) : error ? (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  p: 2,
                  mt: 1,
                }}
              >
                {error}
              </Alert>
            ) : filteredExpenses.length > 0 ? (
              <Fade in={true} style={{ transitionDelay: "150ms" }}>
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      mb: 3,
                    }}
                  >
                    {viewMode === "list" ? (
                      <Box>
                        {filteredExpenses.map((expense, index) => (
                          <Box key={expense.expenseId}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 2,
                                px: 3,
                                borderBottom:
                                  index < filteredExpenses.length - 1
                                    ? "1px solid"
                                    : "none",
                                borderColor: "divider",
                                transition: "background-color 0.2s ease",
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.03
                                  ),
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  flex: 1,
                                  mr: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: `${
                                      index % 3 === 0
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : index % 3 === 1
                                        ? alpha(
                                            theme.palette.secondary.main,
                                            0.1
                                          )
                                        : alpha(theme.palette.success.main, 0.1)
                                    }`,
                                    color: `${
                                      index % 3 === 0
                                        ? "primary.main"
                                        : index % 3 === 1
                                        ? "secondary.main"
                                        : "success.main"
                                    }`,
                                    width: 48,
                                    height: 48,
                                    mr: 2,
                                  }}
                                >
                                  {index % 3 === 0 ? (
                                    <CreditCardOutlined />
                                  ) : index % 3 === 1 ? (
                                    <AccountBalanceWalletOutlined />
                                  ) : (
                                    <ReceiptOutlined />
                                  )}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="medium"
                                  >
                                    {expense.description}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {new Date(
                                      expense.createdAt
                                    ).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  minWidth: 120,
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  color="primary.main"
                                >
                                  {expense.currency}{" "}
                                  {expense.totalAmount.toFixed(2)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {expense.allocations.length}{" "}
                                  {expense.allocations.length === 1
                                    ? "participant"
                                    : "participants"}
                                </Typography>
                              </Box>

                              <Box sx={{ ml: 3, display: "flex", gap: 1 }}>
                                {expense.receiptImageKey && (
                                  <Tooltip title="View Receipt">
                                    <IconButton
                                      component={Link}
                                      href={`/receipts/${expense.receiptImageKey.replace(
                                        "receipts/",
                                        ""
                                      )}`}
                                      target="_blank"
                                      size="small"
                                      sx={{
                                        color: "info.main",
                                        bgcolor: alpha(
                                          theme.palette.info.main,
                                          0.1
                                        ),
                                        "&:hover": {
                                          bgcolor: alpha(
                                            theme.palette.info.main,
                                            0.2
                                          ),
                                        },
                                      }}
                                    >
                                      <ReceiptOutlined fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditExpense(expense)}
                                    sx={{
                                      color: "primary.main",
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1
                                      ),
                                      "&:hover": {
                                        bgcolor: alpha(
                                          theme.palette.primary.main,
                                          0.2
                                        ),
                                      },
                                    }}
                                  >
                                    <EditOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteExpense(expense.expenseId)
                                    }
                                    sx={{
                                      color: "error.main",
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.1
                                      ),
                                      "&:hover": {
                                        bgcolor: alpha(
                                          theme.palette.error.main,
                                          0.2
                                        ),
                                      },
                                    }}
                                  >
                                    <DeleteOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Grid container spacing={0}>
                        {filteredExpenses.map((expense, index) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={expense.expenseId}>
                            <Box
                              sx={{
                                p: 3,
                                borderRight: {
                                  xs: "none",
                                  sm: index % 2 === 0 ? "1px solid" : "none",
                                },
                                borderBottom:
                                  index <
                                  filteredExpenses.length -
                                    (index % 2 === 0 ? 2 : 1)
                                    ? "1px solid"
                                    : "none",
                                borderColor: "divider",
                                height: "100%",
                                transition: "background-color 0.2s ease",
                                position: "relative",
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.03
                                  ),
                                },
                              }}
                            >
                              <IconButton
                                size="small"
                                aria-label="more"
                                onClick={(e) =>
                                  handleExpenseMenuClick(e, expense.expenseId)
                                }
                                sx={{
                                  position: "absolute",
                                  top: 10,
                                  right: 10,
                                  color: "text.secondary",
                                }}
                              >
                                <MoreVertOutlined fontSize="small" />
                              </IconButton>

                              <Menu
                                anchorEl={
                                  expenseMenuAnchorEl[expense.expenseId]
                                }
                                open={Boolean(
                                  expenseMenuAnchorEl[expense.expenseId]
                                )}
                                onClose={() =>
                                  handleExpenseMenuClose(expense.expenseId)
                                }
                                PaperProps={{
                                  sx: {
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                                    borderRadius: 2,
                                    width: 200,
                                  },
                                }}
                              >
                                <MenuItemComponent
                                  onClick={() => {
                                    handleEditExpense(expense);
                                    handleExpenseMenuClose(expense.expenseId);
                                  }}
                                >
                                  <ListItemIcon>
                                    <EditOutlined fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary="Edit" />
                                </MenuItemComponent>

                                {expense.receiptImageKey && (
                                  <MenuItemComponent
                                    component={Link}
                                    href={`/receipts/${expense.receiptImageKey.replace(
                                      "receipts/",
                                      ""
                                    )}`}
                                    target="_blank"
                                    onClick={() =>
                                      handleExpenseMenuClose(expense.expenseId)
                                    }
                                  >
                                    <ListItemIcon>
                                      <ReceiptOutlined fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="View Receipt" />
                                  </MenuItemComponent>
                                )}

                                <Divider />

                                <MenuItemComponent
                                  onClick={() => {
                                    handleDeleteExpense(expense.expenseId);
                                    handleExpenseMenuClose(expense.expenseId);
                                  }}
                                  sx={{ color: "error.main" }}
                                >
                                  <ListItemIcon sx={{ color: "error.main" }}>
                                    <DeleteOutlined fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary="Delete" />
                                </MenuItemComponent>
                              </Menu>

                              <Box sx={{ pb: 1.5 }}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="medium"
                                  noWrap
                                  title={expense.description}
                                >
                                  {expense.description}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    expense.createdAt
                                  ).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </Typography>
                              </Box>

                              <Typography
                                variant="h5"
                                color="primary.main"
                                fontWeight="bold"
                                sx={{ mb: 1.5 }}
                              >
                                {expense.currency}{" "}
                                {expense.totalAmount.toFixed(2)}
                              </Typography>

                              <Divider sx={{ mb: 1.5 }} />

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                              >
                                Paid by:
                              </Typography>
                              <Stack spacing={1} sx={{ mb: 1.5 }}>
                                {expense.allocations.map((allocation, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      py: 0.75,
                                      px: 1.5,
                                      borderRadius: 1.5,
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.04
                                      ),
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {allocation.name}
                                    </Typography>
                                    <Chip
                                      label={`${
                                        expense.currency
                                      } ${allocation.amount.toFixed(2)}`}
                                      size="small"
                                      sx={{
                                        fontWeight: "medium",
                                        bgcolor: alpha(
                                          theme.palette.primary.main,
                                          0.1
                                        ),
                                        color: "primary.main",
                                      }}
                                    />
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Paper>
                </Box>
              </Fade>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 4,
                  bgcolor: "white",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <ReceiptOutlined
                    sx={{ fontSize: 48, color: "primary.main", opacity: 0.7 }}
                  />
                </Box>
                <Typography variant="h5" fontWeight="medium" gutterBottom>
                  No expenses yet
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
                >
                  Get started by adding your first expense and begin tracking
                  your shared travel costs.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  href="/trips/new-expense"
                  startIcon={<AddOutlined />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  }}
                >
                  Add New Expense
                </Button>
              </Box>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Quick Actions
                </Typography>

                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AddOutlined />}
                    component={Link}
                    href="/trips/new-expense"
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      justifyContent: "flex-start",
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    Add New Expense
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadOutlined />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      justifyContent: "flex-start",
                      color: "success.main",
                      borderColor: alpha(theme.palette.success.main, 0.5),
                      "&:hover": {
                        borderColor: "success.main",
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                      },
                    }}
                  >
                    Export Report
                  </Button>
                </Stack>
              </Paper>

              {/* Currency Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Currency Summary
                </Typography>

                <Stack spacing={2}>
                  {Object.entries(currencyTotals).map(
                    ([currency, total], index) => (
                      <Box
                        key={currency}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              mr: 1.5,
                            }}
                          >
                            {currency === "USD"
                              ? "$"
                              : currency === "EUR"
                              ? "€"
                              : currency === "GBP"
                              ? "£"
                              : currency}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {currency === "USD"
                                ? "US Dollar"
                                : currency === "EUR"
                                ? "Euro"
                                : currency === "GBP"
                                ? "British Pound"
                                : currency === "JPY"
                                ? "Japanese Yen"
                                : currency}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {currency} {total.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "background.paper",
                            border: "3px solid",
                            borderColor: theme.palette.primary.main,
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                            color: "primary.main",
                          }}
                        >
                          {((total / totalExpenses) * 100).toFixed(0)}%
                        </Box>
                      </Box>
                    )
                  )}
                </Stack>
              </Paper>

              {/* Top Spenders */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Individual Breakdown
                </Typography>

                <Stack spacing={2}>
                  {Object.entries(personTotals)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, total], index) => (
                      <Box
                        key={name}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor:
                            index === 0
                              ? alpha(theme.palette.warning.main, 0.1)
                              : index === 1
                              ? alpha(theme.palette.info.main, 0.1)
                              : alpha(theme.palette.grey[500], 0.1),
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor:
                                index === 0
                                  ? alpha(theme.palette.warning.main, 0.2)
                                  : index === 1
                                  ? alpha(theme.palette.info.main, 0.2)
                                  : alpha(theme.palette.grey[500], 0.2),
                              color:
                                index === 0
                                  ? "warning.main"
                                  : index === 1
                                  ? "info.main"
                                  : "text.secondary",
                              mr: 1.5,
                            }}
                          >
                            {name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {
                                expenses.filter((e) =>
                                  e.allocations.some((a) => a.name === name)
                                ).length
                              }{" "}
                              expenses
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color={
                            index === 0
                              ? "warning.main"
                              : index === 1
                              ? "info.main"
                              : "text.primary"
                          }
                        >
                          ${total.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            p: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, pl: 1 }}>
          <AttachMoney
            sx={{ color: "primary.main", fontSize: "1.75rem", mr: 1 }}
          />
          <Typography variant="h6" fontWeight="bold">
            Travel Divider
          </Typography>
        </Box>

        <List>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <ListItemIcon sx={{ color: "primary.main" }}>
                <HomeOutlined />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/trips/new-expense"
              sx={{ borderRadius: 2, mb: 1 }}
            >
              <ListItemIcon>
                <AddOutlined />
              </ListItemIcon>
              <ListItemText primary="New Expense" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemIcon>
                <PersonOutlineOutlined />
              </ListItemIcon>
              <ListItemText primary="Team Members" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemIcon>
                <FormatListBulletedOutlined />
              </ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 2 }} />

          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <SettingsOutlined />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Fab for adding expense on mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add expense"
          component={Link}
          href="/trips/new-expense"
          sx={{
            position: "fixed",
            bottom: 76,
            right: 16,
            boxShadow: "0 8px 20px rgba(46, 125, 247, 0.3)",
          }}
        >
          <AddOutlined />
        </Fab>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <Fab
          size="small"
          aria-label="scroll back to top"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: { xs: 140, sm: 30 },
            right: 16,
            zIndex: 1000,
            bgcolor: "background.paper",
            color: "primary.main",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ArrowUpward />
        </Fab>
      )}

      {/* Edit Expense Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: "100%" }}>
            <TextField
              fullWidth
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={editAmount}
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    setEditAmount(newAmount);

                    // Immediately distribute using the new amount value
                    // instead of relying on state update
                    if (editIsShared && newAmount) {
                      distributeExpenseEqually(newAmount);
                    }
                  }}
                  required
                  margin="normal"
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={editCurrency}
                    label="Currency"
                    onChange={(e) => setEditCurrency(e.target.value)}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="JPY">JPY (¥)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editIsShared}
                    onChange={(e) => handleSharedToggle(e.target.checked)}
                  />
                }
                label="This expense is shared equally"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Participants</Typography>
              <Button size="small" onClick={addParticipant}>
                Add Participant
              </Button>
            </Box>

            {editParticipants.map((participant, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 5 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={participant.name}
                      onChange={(e) =>
                        handleParticipantChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 5 }}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={participant.amount}
                      onChange={(e) =>
                        handleParticipantChange(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                      disabled={editIsShared}
                      inputProps={{ step: "0.01", min: "0" }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    <IconButton
                      onClick={() => removeParticipant(index)}
                      disabled={editParticipants.length <= 1}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            {/* Sum validation */}
            {editAmount &&
              editParticipants.filter((p) => p.name && p.amount).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    color={
                      Math.abs(
                        parseFloat(editAmount) -
                          editParticipants.reduce(
                            (sum, p) => sum + (parseFloat(p.amount) || 0),
                            0
                          )
                      ) <= 0.01
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    Total allocations:{" "}
                    {editParticipants
                      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                      .toFixed(2)}
                    (should equal {parseFloat(editAmount).toFixed(2)})
                  </Typography>
                </Box>
              )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleSaveExpense}
            variant="contained"
            color="primary"
            disabled={
              !editDescription ||
              !editAmount ||
              parseFloat(editAmount) <= 0 ||
              editParticipants.filter((p) => p.name && p.amount).length === 0 ||
              Math.abs(
                parseFloat(editAmount) -
                  editParticipants
                    .filter((p) => p.name && p.amount)
                    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
              ) > 0.01
            }
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
}