"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getExpenses, Expense } from "@/lib/aws/api";
import { 
  Box, Typography, Container, Button, Card, CardContent, 
  Grid, CircularProgress, Alert, Divider
} from "@mui/material";

export default function TripsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

                      {expense.receiptImageKey && (
                        <Box sx={{ mt: 2 }}>
                          <Link 
                            href={`/receipts/${expense.receiptImageKey.replace('receipts/', '')}`}
                            target="_blank"
                          >
                            <Button size="small" variant="outlined">View Receipt</Button>
                          </Link>
                        </Box>
                      )}
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
    </Box>
  );
}