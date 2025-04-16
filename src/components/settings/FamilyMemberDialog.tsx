'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FamilyMember } from '@/models/types';
import { v4 as uuidv4 } from 'uuid';

// Common color options
const colorOptions = [
  '#F44336', // Red
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#03A9F4', // Light Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  '#FFEB3B', // Yellow
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
];

interface FamilyMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (member: FamilyMember) => void;
  member?: FamilyMember;
}

export default function FamilyMemberDialog({ 
  open, 
  onClose, 
  onSave, 
  member 
}: FamilyMemberDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2196F3');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens or member changes
  useEffect(() => {
    if (open) {
      if (member) {
        setName(member.name);
        setColor(member.color);
        setAvatar(member.avatar);
      } else {
        setName('');
        setColor('#2196F3');
        setAvatar(undefined);
      }
    }
  }, [open, member]);

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Format name to capitalize each word
  const formatName = (input: string): string => {
    return input
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    // Apply name formatting
    const formattedName = formatName(name);

    const updatedMember: FamilyMember = member 
      ? { 
          ...member, 
          name: formattedName, 
          color, 
          avatar, 
          updatedAt: new Date().toISOString() 
        }
      : {
          id: uuidv4(),
          name: formattedName,
          color,
          avatar,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
    
    onSave(updatedMember);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        {member ? 'Edit Family Member' : 'Add Family Member'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 3
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={avatar} 
                alt={name}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: color,
                  fontSize: '2rem',
                  mb: 1
                }}
              >
                {name ? name.charAt(0).toUpperCase() : '?'}
              </Avatar>
              {loading && (
                <CircularProgress 
                  size={80} 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                  }}
                />
              )}
            </Box>
            <Button
              component="label"
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            inputProps={{ maxLength: 50 }}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select a color:
            </Typography>
            <Grid container spacing={1}>
              {colorOptions.map((colorOption) => (
                <Grid size={{ xs: 'auto' }} key={colorOption}>
                  <Box
                    onClick={() => handleColorSelect(colorOption)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: colorOption,
                      cursor: 'pointer',
                      border: color === colorOption ? '2px solid #000' : 'none',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}