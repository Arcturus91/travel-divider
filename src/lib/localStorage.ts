'use client';

import { FamilyMember } from '@/models/types';

const FAMILY_MEMBERS_KEY = 'travel-divider-family-members';

/**
 * Get all family members from local storage
 */
export const getFamilyMembers = (): FamilyMember[] => {
  if (typeof window === 'undefined') return [];
  
  const storedMembers = localStorage.getItem(FAMILY_MEMBERS_KEY);
  if (!storedMembers) return [];
  
  try {
    return JSON.parse(storedMembers);
  } catch (error) {
    console.error('Error parsing family members from localStorage:', error);
    return [];
  }
};

/**
 * Save family members to local storage
 */
export const saveFamilyMembers = (members: FamilyMember[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(members));
  } catch (error) {
    console.error('Error saving family members to localStorage:', error);
  }
};

/**
 * Add a new family member to local storage
 */
export const addFamilyMember = (member: FamilyMember): void => {
  const members = getFamilyMembers();
  members.push(member);
  saveFamilyMembers(members);
};

/**
 * Update an existing family member in local storage
 */
export const updateFamilyMember = (updatedMember: FamilyMember): void => {
  const members = getFamilyMembers();
  const index = members.findIndex(m => m.id === updatedMember.id);
  
  if (index !== -1) {
    members[index] = updatedMember;
    saveFamilyMembers(members);
  }
};

/**
 * Remove a family member from local storage
 */
export const removeFamilyMember = (id: string): void => {
  const members = getFamilyMembers();
  const filteredMembers = members.filter(m => m.id !== id);
  saveFamilyMembers(filteredMembers);
};