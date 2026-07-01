import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, IconButton, CardMedia, Paper,
  Tabs, Tab, Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  Construction as ConstructionIcon,
  Calculate as CalculateIcon,
  Layers as LayersIcon,
  Home as HomeIcon,
  Build as BuildIcon,
  Architecture as ArchitectureIcon
} from '@mui/icons-material';

// Categories with icons
const CATEGORIES = [
  { id: 'all', name: 'All Formulas', icon: <LayersIcon /> },
  { id: 'foundation', name: 'Foundation', icon: <HomeIcon /> },
  { id: 'concrete', name: 'Concrete', icon: <ConstructionIcon /> },
  { id: 'steel', name: 'Steel & RCC', icon: <ArchitectureIcon /> },
  { id: 'plaster', name: 'Plaster & Finishing', icon: <BuildIcon /> },
  { id: 'measurement', name: 'Measurements', icon: <CalculateIcon /> },
  { id: 'general', name: 'General', icon: <CategoryIcon /> }
];

// Auto-categorize based on filename keywords
const getCategoryFromFilename = (filename) => {
  const lower = filename.toLowerCase();
  if (lower.includes('foundation') || lower.includes('footing')) return 'foundation';
  if (lower.includes('concrete') || lower.includes('cement') || lower.includes('mix')) return 'concrete';
  if (lower.includes('steel') || lower.includes('rcc') || lower.includes('reinforce') || lower.includes('bar')) return 'steel';
  if (lower.includes('plaster') || lower.includes('finish') || lower.includes('wall')) return 'plaster';
  if (lower.includes('measure') || lower.includes('scale') || lower.includes('dimension')) return 'measurement';
  return 'general';
};

// Get title from filename (clean up)
const getTitleFromFilename = (filename) => {
  let name = filename.replace(/^IMG\d+/, '');
  name = name.replace(/^Screenshot_/, '');
  name = name.replace(/_\d{4}-\d{2}-\d{2}/, '');
  name = name.replace(/_[a-f0-9]{32}/, '');
  name = name.replace(/\.(jpg|jpeg|png|gif)$/, '');
  name = name.replace(/[_-]/g, ' ');
  name = name.replace(/\s*-\s*Copy\s*$/, '');
  name = name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  return name || 'Construction Formula';
};

// Get formula based on category
const getFormulaData = (category) => {
  const formulas = {
    foundation: {
      formula: 'qf = Nc × c × sc × dc × ic',
      example: 'qf = 5.14 × 100 × 1.0 × 1.0 × 1.0 = 514 kN/m²',
      description: 'Ultimate bearing capacity of shallow foundations'
    },
    concrete: {
      formula: 'V = L × W × H',
      example: 'V = 10 × 5 × 0.15 = 7.5 m³',
      description: 'Volume of concrete required for slabs'
    },
    steel: {
      formula: 'W = D²/162 × L',
      example: 'W = 16²/162 × 12 = 18.96 kg',
      description: 'Weight of steel reinforcement bars'
    },
    plaster: {
      formula: 'Q = (L × W × T) / 100',
      example: 'Q = (10 × 5 × 15) / 100 = 7.5 bags',
      description: 'Quantity of cement required for plastering'
    },
    measurement: {
      formula: 'A = L × W',
      example: 'A = 10 × 5 = 50 m²',
      description: 'Area calculation for construction'
    },
    general: {
      formula: 'Q = V × Density',
      example: 'Q = 7.5 × 2400 = 18,000 kg',
      description: 'General construction calculation'
    }
  };
  return formulas[category] || formulas.general;
};

export default function FormulaGallery() {
  const [formulas, setFormulas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Your 20 image files
    const imageFiles = [
      'IMG20251103100350.jpg',
      'Screenshot_2025-10-10-15-42-58-61_6012fa4d4ddec268fc5c7112cbb265e7.jpg',
      'Screenshot_2025-10-17-13-17-24-60_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-10-22-13-25-54-69_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-10-27-10-13-26-97_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-10-27-11-06-52-55_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-10-27-11-12-58-07_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-11-05-18-34-44-34_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-11-05-19-27-44-99_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-11-05-19-28-01-60_a23b203fd3aafc6dcb84e438dda678b6.jpg',
      'Screenshot_2025-11-05-19-52-15-37_a23b203fd3aafc6dcb84e438dda678b6.jpg'
    ];

    // Create formula objects from images
    const formulaData = imageFiles.map((filename, index) => {
      const category = getCategoryFromFilename(filename);
      const formulaInfo = getFormulaData(category);
      return {
        id: index + 1,
        image: `/construction-images/${filename}`,
        title: getTitleFromFilename(filename),
        category: category,
        formula: formulaInfo.formula,
        example: formulaInfo.example,
        description: formulaInfo.description,
        tags: [category, 'formula', 'construction']
      };
    });

    setFormulas(formulaData);
    setLoading(false);
  }, []);

  const filteredFormulas = formulas.filter(f => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const styles = {
    container: { padding: '24px', backgroundColor: '#f5f7fa', minHeight: '100vh' },
    header: {
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1a237e 100%)',
      color: 'white',
      padding: '32px',
      borderRadius: '16px',
      marginBottom: '24px'
    },
    headerTitle: { fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' },
    headerSub: { fontSize: '16px', opacity: 0.9 },
    card: {
      height: '100%',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
      }
    },
    cardMedia: { height: 200, objectFit: 'cover', backgroundColor: '#e0e0e0' },
    cardContent: { padding: '16px' },
    categoryChip: { marginBottom: '8px' },
    formulaDisplay: {
      backgroundColor: '#f5f5f5',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '16px',
      margin: '8px 0'
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {[1,2,3,4,5,6].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={20} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography variant="h4" sx={styles.headerTitle}>
          📐 BuildMitra Formulas
        </Typography>
        <Typography variant="body1" sx={styles.headerSub}>
          Essential construction formulas and calculations for your projects
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${formulas.length} Formulas`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          <Chip label={`${CATEGORIES.length - 1} Categories`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <TextField
          placeholder="🔍 Search formulas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: '200px', backgroundColor: 'white', borderRadius: '8px' }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
        />
      </Box>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onChange={(e, v) => setSelectedCategory(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, backgroundColor: 'white', borderRadius: '8px', padding: '8px' }}
      >
        {CATEGORIES.map(cat => (
          <Tab
            key={cat.id}
            label={cat.name}
            value={cat.id}
            icon={cat.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>

      {/* Formula Grid */}
      <Grid container spacing={3}>
        {filteredFormulas.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ImageIcon sx={{ fontSize: 60, color: '#ccc' }} />
              <Typography variant="h6" sx={{ mt: 2 }}>No formulas found</Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search or filter
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredFormulas.map((formula) => (
            <Grid item xs={12} sm={6} md={4} key={formula.id}>
              <Card sx={styles.card} onClick={() => setSelectedFormula(formula)}>
                <CardMedia
                  component="img"
                  sx={styles.cardMedia}
                  image={formula.image}
                  alt={formula.title}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <CardContent sx={styles.cardContent}>
                  <Chip
                    label={CATEGORIES.find(c => c.id === formula.category)?.name || formula.category}
                    size="small"
                    color="primary"
                    sx={styles.categoryChip}
                  />
                  <Typography variant="h6" gutterBottom noWrap>
                    {formula.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {formula.description}
                  </Typography>
                  <Box sx={styles.formulaDisplay}>
                    {formula.formula}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Click to view details
                    </Typography>
                    <Chip label="View" size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Formula Detail Dialog */}
      <Dialog
        open={!!selectedFormula}
        onClose={() => setSelectedFormula(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedFormula && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {selectedFormula.title}
                </Typography>
                <IconButton onClick={() => setSelectedFormula(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box
                component="img"
                src={selectedFormula.image}
                alt={selectedFormula.title}
                sx={{ width: '100%', maxHeight: 350, objectFit: 'contain', borderRadius: '8px', mb: 2 }}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <Chip 
                label={CATEGORIES.find(c => c.id === selectedFormula.category)?.name || selectedFormula.category} 
                color="primary" 
                sx={{ mb: 2 }} 
              />
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedFormula.description}
              </Typography>
              
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
                📐 Formula:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2, fontFamily: 'monospace', fontSize: '18px' }}>
                {selectedFormula.formula}
              </Paper>
              
              <Typography variant="subtitle2" fontWeight="bold">
                💡 Example:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#e8f5e9', mb: 2, fontFamily: 'monospace', fontSize: '16px' }}>
                {selectedFormula.example}
              </Paper>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {selectedFormula.tags?.map(tag => (
                  <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedFormula(null)}>Close</Button>
              <Button variant="contained" color="primary">Download Formula</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
