"use client";

import { useEffect, useState } from "react";
import { getDownloadUrl } from "@/lib/aws/api";
import { useParams } from "next/navigation";
import { Box, Container, Paper, Typography, CircularProgress, Alert, Button } from "@mui/material";
import Link from "next/link";

export default function ReceiptViewerPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Get the file key from the URL path segments
  const keySegments = Array.isArray(params.key) ? params.key : [params.key];
  const fileKey = keySegments.join('/');
  
  useEffect(() => {
    async function fetchImageUrl() {
      try {
        setLoading(true);
        console.log("Fetching image with key:", fileKey);
        
        // Get a download URL for the receipt image
        const { downloadUrl } = await getDownloadUrl(fileKey);
        setImageUrl(downloadUrl);
        setError(null);
      } catch (err) {
        console.error("Error fetching receipt image:", err);
        setError("Could not load receipt image. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    if (fileKey) {
      fetchImageUrl();
    } else {
      setError("No receipt key provided");
      setLoading(false);
    }
  }, [fileKey]);
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5">Receipt Viewer</Typography>
          <Button variant="outlined" component={Link} href="/trips">
            Back to Expenses
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : imageUrl ? (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Box 
              component="img"
              src={imageUrl}
              alt="Receipt"
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 1,
                boxShadow: 1,
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                href={imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open Full Size
              </Button>
            </Box>
          </Box>
        ) : (
          <Alert severity="warning">No image URL available</Alert>
        )}
      </Paper>
    </Container>
  );
}