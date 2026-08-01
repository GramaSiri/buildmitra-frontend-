import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent, Chip, Button, Tooltip, InputAdornment, TextField
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { BlockItem } from '../../../utils/games/layoutValidation';

export interface BlockTemplate {
  name: string;
  category: 'room' | 'structure' | 'door_window' | 'furniture' | 'external';
  defaultWidth: number; // in feet
  defaultLength: number; // in feet
  color: string;
  iconSymbol: string;
  description: string;
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  // 1. ROOMS
  { name: 'Living Room', category: 'room', defaultWidth: 16, defaultLength: 14, color: '#bbdefb', iconSymbol: '🛋️', description: 'Main family living space' },
  { name: 'Drawing Room', category: 'room', defaultWidth: 14, defaultLength: 12, color: '#c8e6c9', iconSymbol: '🛋️', description: 'Formal guest receiving area' },
  { name: 'Master Bedroom', category: 'room', defaultWidth: 14, defaultLength: 12, color: '#e1bee7', iconSymbol: '🛏️', description: 'Primary bedroom with attached bath space' },
  { name: 'Bedroom', category: 'room', defaultWidth: 12, defaultLength: 10, color: '#f8bbd0', iconSymbol: '🛏️', description: 'Standard bedroom' },
  { name: 'Kitchen', category: 'room', defaultWidth: 10, defaultLength: 8, color: '#ffe0b2', iconSymbol: '🍳', description: 'Cooking area with platform' },
  { name: 'Dining Room', category: 'room', defaultWidth: 12, defaultLength: 10, color: '#d1c4e9', iconSymbol: '🍽️', description: 'Dining area near kitchen' },
  { name: 'Toilet', category: 'room', defaultWidth: 7, defaultLength: 4.5, color: '#b2ebf2', iconSymbol: '🚽', description: 'Combined WC & wash space' },
  { name: 'Bathroom', category: 'room', defaultWidth: 6, defaultLength: 5, color: '#b2dfdb', iconSymbol: '🚿', description: 'Bathing area' },
  { name: 'Utility', category: 'room', defaultWidth: 6, defaultLength: 5, color: '#cfd8dc', iconSymbol: '🧺', description: 'Washing & utility area' },
  { name: 'Puja Room', category: 'room', defaultWidth: 5, defaultLength: 5, color: '#fff9c4', iconSymbol: '🪔', description: 'Prayer and meditation room' },
  { name: 'Study Room', category: 'room', defaultWidth: 10, defaultLength: 8, color: '#d7ccc8', iconSymbol: '📚', description: 'Home office or study' },
  { name: 'Store Room', category: 'room', defaultWidth: 6, defaultLength: 5, color: '#e0e0e0', iconSymbol: '📦', description: 'Storage area' },
  { name: 'Balcony', category: 'room', defaultWidth: 10, defaultLength: 4, color: '#c8e6c9', iconSymbol: '🏞️', description: 'Open cantilever balcony' },
  { name: 'Veranda', category: 'room', defaultWidth: 12, defaultLength: 6, color: '#ded2f9', iconSymbol: '🏡', description: 'Covered front sit-out' },
  { name: 'Staircase', category: 'room', defaultWidth: 7, defaultLength: 14, color: '#ffcc80', iconSymbol: '🪜', description: 'Dog-legged RCC staircase' },
  { name: 'Lift Core', category: 'room', defaultWidth: 6, defaultLength: 6, color: '#b3e5fc', iconSymbol: '🛗', description: 'Elevator shaft core' },
  { name: 'Parking Bay', category: 'room', defaultWidth: 16, defaultLength: 10, color: '#d1c4e9', iconSymbol: '🚗', description: 'Car parking garage or portico' },
  { name: 'Passage', category: 'room', defaultWidth: 10, defaultLength: 3.5, color: '#f5f5f5', iconSymbol: '🚶', description: 'Circulation corridor' },
  { name: 'Open-To-Sky (OTS)', category: 'room', defaultWidth: 5, defaultLength: 4, color: '#e0f7fa', iconSymbol: '☀️', description: 'Courtyard / OTS light shaft' },

  // 2. STRUCTURAL ELEMENTS
  { name: 'Column (9"x15")', category: 'structure', defaultWidth: 1.25, defaultLength: 0.75, color: '#37474f', iconSymbol: '🏛️', description: 'RCC Structural Column' },
  { name: 'Beam Line', category: 'structure', defaultWidth: 10, defaultLength: 0.75, color: '#546e7a', iconSymbol: '📏', description: 'RCC Structural Beam' },
  { name: 'Brick Wall (9")', category: 'structure', defaultWidth: 10, defaultLength: 0.75, color: '#bf360c', iconSymbol: '🧱', description: 'Main Load-Bearing Wall' },
  { name: 'Partition Wall (4.5")', category: 'structure', defaultWidth: 8, defaultLength: 0.38, color: '#d84315', iconSymbol: '🧱', description: 'Internal Partition Wall' },
  { name: 'Slab Zone', category: 'structure', defaultWidth: 12, defaultLength: 12, color: '#90a4ae', iconSymbol: '⬜', description: 'RCC Slab Panel' },
  { name: 'Footing Marker', category: 'structure', defaultWidth: 4, defaultLength: 4, color: '#78909c', iconSymbol: '⚓', description: 'Isolated Column Footing' },

  // 3. DOORS AND WINDOWS
  { name: 'Main Door (3.5\')', category: 'door_window', defaultWidth: 3.5, defaultLength: 1, color: '#8d6e63', iconSymbol: '🚪', description: 'Teakwood Entrance Door' },
  { name: 'Internal Door (3\')', category: 'door_window', defaultWidth: 3, defaultLength: 0.8, color: '#a1887f', iconSymbol: '🚪', description: 'Flush Room Door' },
  { name: 'Sliding Door (6\')', category: 'door_window', defaultWidth: 6, defaultLength: 0.8, color: '#bcaaa4', iconSymbol: '🚪', description: 'Glass Balcony Slider' },
  { name: 'Single Window (3\')', category: 'door_window', defaultWidth: 3, defaultLength: 0.8, color: '#81d4fa', iconSymbol: '🪟', description: 'Glazed Window' },
  { name: 'Double Window (5\')', category: 'door_window', defaultWidth: 5, defaultLength: 0.8, color: '#4fc3f7', iconSymbol: '🪟', description: '3-Track UPVC Window' },
  { name: 'Ventilator (2\')', category: 'door_window', defaultWidth: 2, defaultLength: 0.6, color: '#29b6f6', iconSymbol: '🪟', description: 'Toilet Louver Ventilator' },

  // 4. FURNITURE AND FIXTURES
  { name: 'Sofa Set', category: 'furniture', defaultWidth: 7, defaultLength: 3, color: '#ab47bc', iconSymbol: '🛋️', description: '3-Seater Sofa' },
  { name: 'King Bed', category: 'furniture', defaultWidth: 6.5, defaultLength: 6, color: '#8e24aa', iconSymbol: '🛏️', description: 'King Size Bed with Side Tables' },
  { name: 'Wardrobe', category: 'furniture', defaultWidth: 6, defaultLength: 2, color: '#7b1fa2', iconSymbol: '🚪', description: 'Bedroom Wardrobe' },
  { name: 'Dining Table (6-Seat)', category: 'furniture', defaultWidth: 6, defaultLength: 3.5, color: '#6a1b9a', iconSymbol: '🪑', description: '6-Seater Dining Set' },
  { name: 'Kitchen Counter', category: 'furniture', defaultWidth: 8, defaultLength: 2, color: '#ffb74d', iconSymbol: '🔪', description: 'Granite Cooking Platform' },
  { name: 'WC Unit', category: 'furniture', defaultWidth: 1.5, defaultLength: 2.2, color: '#26c6da', iconSymbol: '🚽', description: 'European Water Closet' },
  { name: 'Wash Basin', category: 'furniture', defaultWidth: 1.8, defaultLength: 1.5, color: '#00bcd4', iconSymbol: '🚰', description: 'Wash Basin with Tap' },

  // 5. EXTERNAL ELEMENTS
  { name: 'Compound Wall', category: 'external', defaultWidth: 15, defaultLength: 0.75, color: '#795548', iconSymbol: '🧱', description: 'Boundary Wall' },
  { name: 'Main Gate', category: 'external', defaultWidth: 10, defaultLength: 1, color: '#5d4037', iconSymbol: '🚧', description: 'Compound Iron Gate' },
  { name: 'Garden Zone', category: 'external', defaultWidth: 10, defaultLength: 8, color: '#81c784', iconSymbol: '🌳', description: 'Lawn & Plantation' },
  { name: 'Sump Tank', category: 'external', defaultWidth: 6, defaultLength: 6, color: '#4dd0e1', iconSymbol: '💧', description: 'Underground Water Sump' },
  { name: 'Septic Tank', category: 'external', defaultWidth: 7, defaultLength: 4, color: '#8d6e63', iconSymbol: '☣️', description: 'Sub-surface Septic Tank' }
];

interface BlockPaletteProps {
  onAddBlock: (template: BlockTemplate) => void;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');

  const categories: BlockTemplate['category'][] = ['room', 'structure', 'door_window', 'furniture', 'external'];
  const activeCategory = categories[tabIndex];

  const filtered = BLOCK_TEMPLATES.filter(b => {
    const matchesCategory = b.category === activeCategory;
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1a237e' }}>
        🧩 Block Library
      </Typography>

      <TextField
        size="small"
        placeholder="Search blocks..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 1.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          )
        }}
      />

      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Rooms" />
        <Tab label="Structure" />
        <Tab label="Doors & Windows" />
        <Tab label="Furniture" />
        <Tab label="External" />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        <Grid container spacing={1}>
          {filtered.map((item, idx) => (
            <Grid item xs={12} key={idx}>
              <Card
                variant="outlined"
                sx={{
                  p: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                    transform: 'scale(1.01)'
                  }
                }}
                onClick={() => onAddBlock(item)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontSize: 20
                    }}
                  >
                    {item.iconSymbol}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '13px', lineHeight: 1.2 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {item.defaultWidth}' × {item.defaultLength}'
                    </Typography>
                  </Box>
                </Box>

                <Tooltip title="Tap or click to add block to canvas">
                  <Button size="small" variant="contained" color="primary" sx={{ minWidth: 32, px: 1, borderRadius: 2 }}>
                    <AddIcon fontSize="small" />
                  </Button>
                </Tooltip>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};
