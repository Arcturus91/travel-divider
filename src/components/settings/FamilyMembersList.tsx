'use client';

import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Paper,
  Box,
  Divider,
  Button,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import InfoIcon from '@mui/icons-material/Info';
import { FamilyMember } from '@/models/types';
import FamilyMemberDialog from './FamilyMemberDialog';
import ConfirmationDialog from './ConfirmationDialog';

interface FamilyMembersListProps {
  members: FamilyMember[];
  onAddMember: (member: FamilyMember) => void;
  onUpdateMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
}

export default function FamilyMembersList({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: FamilyMembersListProps) {
  const theme = useTheme();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | undefined>(
    undefined
  );

  const handleAddMember = () => {
    setSelectedMember(undefined);
    setMemberDialogOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setMemberDialogOpen(true);
  };

  const handleDeleteMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedMember) {
      onDeleteMember(selectedMember.id);
      setConfirmDialogOpen(false);
    }
  };

  const handleSaveMember = (member: FamilyMember) => {
    if (selectedMember) {
      onUpdateMember(member);
    } else {
      onAddMember(member);
    }
  };

  return (
    <>
      <Paper elevation={1} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6">Family Members</Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
            onClick={handleAddMember}
            size="small"
          >
            Add Member
          </Button>
        </Box>
        <Divider />

        {members.length === 0 ? (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'text.secondary',
            }}
          >
            <InfoIcon sx={{ fontSize: 48, mb: 2, color: 'text.disabled' }} />
            <Typography variant="subtitle1" align="center" gutterBottom>
              No family members added yet
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
              Add family members to easily split expenses with them
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              onClick={handleAddMember}
            >
              Add First Member
            </Button>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {members.map((member, index) => (
              <Box key={member.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditMember(member)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteMember(member)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={member.name}
                      src={member.avatar}
                      sx={{ bgcolor: member.color }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={
                      <Box 
                        component="span" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center' 
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: member.color,
                            mr: 1,
                          }}
                        />
                        <Typography
                          variant="body2"
                          component="span"
                          color="text.secondary"
                        >
                          Added {new Date(member.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      <FamilyMemberDialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        onSave={handleSaveMember}
        member={selectedMember}
      />

      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Delete Family Member"
        message={`Are you sure you want to delete ${
          selectedMember?.name || 'this family member'
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialogOpen(false)}
        severity="error"
      />
    </>
  );
}