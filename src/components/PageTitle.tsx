'use client';

import { ReactNode } from 'react';
import { Typography, Box, Breadcrumbs, Link as MuiLink, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PageTitleProps {
  title?: string;
  children?: ReactNode;
  showBreadcrumbs?: boolean;
}

export default function PageTitle({ title, children, showBreadcrumbs = true }: PageTitleProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Generate breadcrumb paths from the current path
  const generateBreadcrumbs = () => {
    // Skip if we're at the root
    if (pathname === '/') return [];
    
    // Split the path into segments
    const segments = pathname.split('/').filter(Boolean);
    
    // Create breadcrumb items
    const breadcrumbs = segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        path,
        label,
        isLast: index === segments.length - 1
      };
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  return (
    <Box 
      sx={{ 
        mb: 4, 
        mt: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 0 }
      }}
    >
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          aria-label="breadcrumb" 
          sx={{ 
            mb: 1,
            '& .MuiBreadcrumbs-ol': {
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }
          }}
        >
          <MuiLink 
            component={Link} 
            href="/" 
            color="inherit" 
            underline="hover"
          >
            Home
          </MuiLink>
          
          {breadcrumbs.map((crumb, index) => (
            crumb.isLast ? (
              <Typography key={index} color="text.primary" aria-current="page">
                {crumb.label}
              </Typography>
            ) : (
              <MuiLink
                key={index}
                component={Link}
                href={crumb.path}
                color="inherit"
                underline="hover"
              >
                {crumb.label}
              </MuiLink>
            )
          ))}
        </Breadcrumbs>
      )}
      
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        color="primary.main"
        fontWeight="bold"
      >
        {title || children}
      </Typography>
    </Box>
  );
}