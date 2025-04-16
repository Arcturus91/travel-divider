"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Grid,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { createExpense, getUploadUrl, uploadFile } from "@/lib/aws/api";

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isShared, setIsShared] = useState(true);
  const [participants, setParticipants] = useState([
    { name: "", amount: "" },
    { name: "", amount: "" },
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle participant changes
  const handleParticipantChange = (index: number, field: 'name' | 'amount', value: string) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  // Add a new participant field
  const addParticipant = () => {
    setParticipants([...participants, { name: "", amount: "" }]);
  };

  // Remove a participant field
  const removeParticipant = (index: number) => {
    if (participants.length > 2) {
      const newParticipants = [...participants];
      newParticipants.splice(index, 1);
      setParticipants(newParticipants);
    }
  };

  // Upload a file and get its key
  const uploadReceiptFile = async (file: File): Promise<string> => {
    try {
      setUploadProgress(true);
      // Get a pre-signed URL for uploading
      const { uploadUrl, fileKey } = await getUploadUrl(file.type, file.name);

      // Upload the file using the pre-signed URL
      await uploadFile(uploadUrl, file);

      setUploadProgress(false);
      return fileKey;
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadProgress(false);
      throw new Error("Failed to upload receipt");
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!description || !amount) {
        throw new Error("Please fill in all required fields");
      }

      const totalAmount = parseFloat(amount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Validate allocations
      const validParticipants = participants.filter(p => p.name && p.amount);
      if (validParticipants.length < 1) {
        throw new Error("Please add at least one participant with name and amount");
      }

      // Check if total allocations match the total amount
      const totalAllocations = validParticipants.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0), 
        0
      );
      
      if (Math.abs(totalAllocations - totalAmount) > 0.01) {
        throw new Error(`Total allocations (${totalAllocations}) must equal total amount (${totalAmount})`);
      }

      // Upload receipt if selected
      let receiptKey = null;
      if (selectedFile) {
        receiptKey = await uploadReceiptFile(selectedFile);
        setFileKey(receiptKey);
      }

      // Prepare expense data
      const expenseData = {
        description,
        totalAmount: parseFloat(amount),
        currency,
        isShared,
        receiptImageKey: receiptKey,
        allocations: validParticipants.map(p => ({
          name: p.name,
          amount: parseFloat(p.amount),
        })),
      };

      // Create expense
      await createExpense(expenseData);
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/trips");
      }, 2000);
    } catch (err) {
      console.error("Error creating expense:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Paper sx={{ p: { xs: 2, sm: 4 } }}>
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Expense created successfully!
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Typography variant="h6" gutterBottom>
                Expense Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={currency}
                      label="Currency"
                      onChange={(e) => setCurrency(e.target.value)}
                      disabled={loading}
                    >
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                      <MenuItem value="GBP">GBP (£)</MenuItem>
                      <MenuItem value="JPY">JPY (¥)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="This expense is shared"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Participants</Typography>
                    <Button
                      size="small"
                      onClick={addParticipant}
                      disabled={loading}
                    >
                      Add Participant
                    </Button>
                  </Box>

                  {participants.map((participant, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={participant.name}
                            onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                            disabled={loading}
                            required
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={participant.amount}
                            onChange={(e) => handleParticipantChange(index, 'amount', e.target.value)}
                            disabled={loading}
                            inputProps={{ step: "0.01", min: "0" }}
                            required
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton 
                            onClick={() => removeParticipant(index)}
                            disabled={participants.length <= 2 || loading}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Receipt
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 1 }}
                    disabled={loading || uploadProgress}
                  >
                    Upload Receipt
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                  </Button>
                  {selectedFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {selectedFile.name}
                    </Typography>
                  )}
                  {uploadProgress && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body2">Uploading...</Typography>
                    </Box>
                  )}
                  {fileKey && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      Receipt uploaded successfully!
                    </Alert>
                  )}
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} /> : "Save Expense"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}