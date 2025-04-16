/**
 * API client for interacting with the Travel Divider application
 * This client calls the Next.js API routes, which then proxy to AWS API Gateway
 */

export interface Allocation {
  name: string;
  amount: number;
}

export interface Expense {
  expenseId: string;
  description: string;
  totalAmount: number;
  currency: string;
  isShared: boolean;
  receiptImageKey: string | null;
  category: string;
  tripId: string | null;
  allocations: Allocation[];
  createdAt: string;
}

/**
 * Fetch all expenses
 */
export async function getExpenses(): Promise<Expense[]> {
  const response = await fetch('/api/expenses', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch expenses: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Create a new expense
 */
export async function createExpense(expenseData: {
  description: string;
  totalAmount: number;
  currency: string;
  isShared: boolean;
  allocations: Allocation[];
  category?: string;
  tripId?: string;
}): Promise<Expense> {
  const response = await fetch('/api/expenses', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create expense: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get a pre-signed URL for uploading a receipt
 */
export async function getUploadUrl(
  fileType: string,
  fileName: string
): Promise<{
  uploadUrl: string;
  fileKey: string;
  expiresAt: string;
}> {
  const response = await fetch(
    `/api/upload-url?contentType=${encodeURIComponent(
      fileType
    )}&fileName=${encodeURIComponent(fileName)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get upload URL: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Upload a file using a pre-signed URL
 */
export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload file: ${response.status} ${response.statusText}`
    );
  }
}

/**
 * Get a download URL for a receipt
 */
export async function getDownloadUrl(fileKey: string): Promise<{
  downloadUrl: string;
  expiresAt: string;
}> {
  const response = await fetch(
    `/api/download-url?fileKey=${encodeURIComponent(fileKey)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get download URL: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Update an expense
 */
export async function updateExpense(
  expenseId: string,
  expenseData: Partial<Expense>
): Promise<Expense> {
  const response = await fetch(`/api/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update expense: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  const response = await fetch(`/api/expenses/${expenseId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to delete expense: ${response.status} ${response.statusText}`
    );
  }
}