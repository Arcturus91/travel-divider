"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getExpenses, updateExpense, deleteExpense, Expense } from "@/lib/aws/api";
import { useRouter } from "next/navigation";
import { 
  Box, Typography, Container, Button, Card, CardContent, 
  Grid, CircularProgress, Alert, Divider, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, TextField,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Switch,
  FormControlLabel, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TripsPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit expense state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editIsShared, setEditIsShared] = useState(true);
  const [editParticipants, setEditParticipants] = useState<Array<{name: string, amount: string}>>([]);
  
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
    const participants = expense.allocations.map(allocation => ({
      name: allocation.name,
      amount: allocation.amount.toString()
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
    
    console.log("Distributing amount:", totalAmount, "among", editParticipants.length, "participants");
    
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
        p.amount = (parseFloat(shareAmount) + parseFloat(roundingDiff)).toFixed(2);
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
      const validParticipants = editParticipants.filter((p) => p.name && p.amount);
      if (validParticipants.length < 1) {
        throw new Error("Please add at least one participant with name and amount");
      }

      // Check if total allocations match the total amount
      const totalAllocations = validParticipants.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );

      if (Math.abs(totalAllocations - totalAmount) > 0.01) {
        throw new Error(
          `Total allocations (${totalAllocations.toFixed(2)}) must equal total amount (${totalAmount.toFixed(2)})`
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
        allocations: validParticipants.map(p => ({
          name: p.name,
          amount: parseFloat(p.amount)
        }))
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
      setError(err instanceof Error ? err.message : "Failed to update expense. Please try again.");
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
      setExpenses(expenses.filter(exp => exp.expenseId !== deleteExpenseId));
      
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

  // Calculate total expenses amount
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Travel Divider
          </Typography>
          <Typography variant="h6">
            Your Expenses Dashboard
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Recent Expenses
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track your travel expenses
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            component={Link} 
            href="/trips/new-expense"
            size="large"
          >
            Add New Expense
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        ) : expenses.length > 0 ? (
          <>
            <Box sx={{ mb: 4, p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                ${totalExpenses.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total expenses ({expenses.length} items)
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {expenses.map((expense) => (
                <Grid item xs={12} md={6} lg={4} key={expense.expenseId}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {expense.description}
                      </Typography>
                      <Typography variant="h5" color="primary.main" fontWeight="bold">
                        {expense.currency} {expense.totalAmount.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Created: {new Date(expense.createdAt).toLocaleDateString()}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Paid by:
                      </Typography>
                      {expense.allocations.map((allocation, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: "flex", 
                            justifyContent: "space-between",
                            mb: 0.5
                          }}
                        >
                          <Typography variant="body2">{allocation.name}</Typography>
                          <Typography variant="body2">
                            {expense.currency} {allocation.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}

                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                        {expense.receiptImageKey && (
                          <Link 
                            href={`/receipts/${expense.receiptImageKey.replace('receipts/', '')}`}
                            target="_blank"
                          >
                            <Button size="small" variant="outlined">View Receipt</Button>
                          </Link>
                        )}
                        
                        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="primary"
                            onClick={() => handleEditExpense(expense)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={() => handleDeleteExpense(expense.expenseId)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 4,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              No expenses yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start by adding your first expense
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/trips/new-expense"
            >
              Add New Expense
            </Button>
          </Box>
        )}
      </Container>

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: '100%' }}>
            <TextField
              fullWidth
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Button
                size="small"
                onClick={addParticipant}
              >
                Add Participant
              </Button>
            </Box>
            
            {editParticipants.map((participant, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
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
                  <Grid item xs={5}>
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
                  <Grid item xs={2}>
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
            {editAmount && editParticipants.filter(p => p.name && p.amount).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color={
                  Math.abs(
                    parseFloat(editAmount) - 
                    editParticipants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                  ) <= 0.01 ? "success.main" : "error.main"
                }>
                  Total allocations: {editParticipants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)} 
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
              editParticipants.filter(p => p.name && p.amount).length === 0 ||
              Math.abs(
                parseFloat(editAmount) - 
                editParticipants.filter(p => p.name && p.amount)
                  .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
              ) > 0.01
            }
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
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