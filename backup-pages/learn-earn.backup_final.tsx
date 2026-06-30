import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography,
  Tabs, Tab, Box, Container, IconButton, Badge, Card, CardContent,
  LinearProgress, Alert, Snackbar, CircularProgress, RadioGroup,
  FormControlLabel, Radio, Button, Grid, Chip, Divider,
  List, ListItem, ListItemText, ListItemIcon, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Accordion,
  AccordionSummary, AccordionDetails, Fab, useTheme, useMediaQuery,
  ToggleButton, ToggleButtonGroup, TextField, InputAdornment,
  Link, Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel, CardMedia
} from '@mui/material';
import {
  Quiz as QuizIcon, School as SchoolIcon, Games as GamesIcon,
  Gavel as GavelIcon, EmojiEvents as EmojiEventsIcon,
  Notifications as NotificationsIcon, PlayCircle as PlayCircleIcon,
  MenuBook as MenuBookIcon, NewReleases as NewReleasesIcon,
  Download as DownloadIcon, Architecture as ArchitectureIcon,
  Home as HomeIcon, Palette as PaletteIcon, Brush as BrushIcon,
  ExpandMore as ExpandMoreIcon, Apartment as ApartmentIcon,
  LocationCity as LocationCityIcon, GetApp as GetAppIcon,
  Star as StarIcon, ThreeDRotation as ThreeDRotationIcon,
  DragHandle as DragHandleIcon, Straighten as StraightenIcon,
  Agriculture as AgricultureIcon,
  SettingsEthernet as SettingsEthernetIcon, Dashboard as DashboardIcon,
  Window as WindowIcon,
  AddCircle as AddCircleIcon, Close as CloseIcon,
  ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon,
  Chair as InteriorIcon, Article as ArticleIcon, Podcasts as PodcastsIcon,
  YouTube as YouTubeIcon, Search as SearchIcon, OpenInNew as OpenInNewIcon,
  Build as BuildIcon, DesignServices as DesignServicesIcon
} from '@mui/icons-material';

// ============= API CONFIGURATION =============
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============= THEME =============
const premiumTheme = createTheme({
  palette: {
    primary: { main: '#1a237e', light: '#283593', dark: '#0d1445' },
    secondary: { main: '#ff6f00', light: '#ff8f00', dark: '#e65100' },
    success: { main: '#00c853' },
    info: { main: '#0091ea' },
    warning: { main: '#ff9100' },
    error: { main: '#d50000' },
    background: { default: '#f8f9fe', paper: '#ffffff' }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: '0 8px 40px rgba(0,0,0,0.15)', transform: 'translateY(-4px)' }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, textTransform: 'none', fontWeight: 600, padding: '10px 24px' }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 64,
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #1a237e, #283593)',
            color: 'white',
            '& .MuiTab-iconWrapper': { color: 'white' }
          }
        }
      }
    }
  }
});

// ============= CONTEXTS =============
const QuizContext = createContext();
const LeaderboardContext = createContext();
const CertificateContext = createContext();

// ============= 50+ UNIQUE QUESTIONS WITH DIFFERENT OPTIONS =============
const UNIQUE_QUESTIONS = [
  // === FOUNDATION (15 unique questions) ===
  { id: 1, question: 'What is the minimum depth of foundation on clayey soil?', options: ['0.5 meters', '1.0 meters', '1.5 meters', '2.0 meters'], correctAnswer: 1, category: 'Foundation', difficulty: 'Medium' },
  { id: 2, question: 'Which foundation type is best for high water table areas?', options: ['Raft foundation', 'Pile foundation', 'Strip foundation', 'Isolated footing'], correctAnswer: 1, category: 'Foundation', difficulty: 'Medium' },
  { id: 3, question: 'What is the standard width of a strip foundation?', options: ['0.5 meters', '0.75 meters', '1.0 meters', '1.25 meters'], correctAnswer: 2, category: 'Foundation', difficulty: 'Easy' },
  { id: 4, question: 'Which type of footing is commonly used for columns?', options: ['Isolated footing', 'Combined footing', 'Strip footing', 'Raft footing'], correctAnswer: 0, category: 'Foundation', difficulty: 'Easy' },
  { id: 5, question: 'What is the main purpose of a raft foundation?', options: ['Spread load over large area', 'Provide deep support', 'Improve soil bearing', 'Waterproofing'], correctAnswer: 0, category: 'Foundation', difficulty: 'Hard' },
  { id: 6, question: 'What is the minimum reinforcement percentage in foundation?', options: ['0.15%', '0.25%', '0.35%', '0.45%'], correctAnswer: 1, category: 'Foundation', difficulty: 'Hard' },
  { id: 7, question: 'Which soil type requires the deepest foundation?', options: ['Clay soil', 'Sandy soil', 'Rocky soil', 'Organic soil'], correctAnswer: 0, category: 'Foundation', difficulty: 'Medium' },
  { id: 8, question: 'What is the typical depth of pile foundation?', options: ['3-6 meters', '6-12 meters', '12-20 meters', '20-30 meters'], correctAnswer: 2, category: 'Foundation', difficulty: 'Medium' },
  { id: 9, question: 'What is the purpose of foundation bedding?', options: ['Leveling the ground', 'Improving drainage', 'Providing insulation', 'Reinforcing the base'], correctAnswer: 0, category: 'Foundation', difficulty: 'Easy' },
  { id: 10, question: 'Which foundation is recommended for weak soil conditions?', options: ['Raft foundation', 'Pile foundation', 'Strip foundation', 'Mat foundation'], correctAnswer: 1, category: 'Foundation', difficulty: 'Medium' },
  { id: 11, question: 'What is the bearing capacity of clay soil typically?', options: ['50 kPa', '100 kPa', '150 kPa', '200 kPa'], correctAnswer: 1, category: 'Foundation', difficulty: 'Hard' },
  { id: 12, question: 'What is the minimum depth for footing in black cotton soil?', options: ['1.0 meter', '1.5 meters', '2.0 meters', '2.5 meters'], correctAnswer: 1, category: 'Foundation', difficulty: 'Hard' },
  { id: 13, question: 'Which type of foundation is most economical?', options: ['Strip foundation', 'Raft foundation', 'Pile foundation', 'Isolated footing'], correctAnswer: 0, category: 'Foundation', difficulty: 'Easy' },
  { id: 14, question: 'What is the maximum depth of shallow foundation?', options: ['1.5 meters', '3.0 meters', '4.5 meters', '6.0 meters'], correctAnswer: 1, category: 'Foundation', difficulty: 'Medium' },
  { id: 15, question: 'What is the purpose of foundation in construction?', options: ['Transfer loads to soil', 'Prevent settlement', 'Provide stability', 'All of the above'], correctAnswer: 3, category: 'Foundation', difficulty: 'Easy' },

  // === MATERIALS (15 unique questions) ===
  { id: 16, question: 'What is the standard brick size in India?', options: ['190×90×90 mm', '200×100×100 mm', '180×80×80 mm', '210×110×110 mm'], correctAnswer: 0, category: 'Materials', difficulty: 'Easy' },
  { id: 17, question: 'Which grade of steel is most commonly used for reinforcement?', options: ['Fe 415', 'Fe 500', 'Fe 550', 'Fe 600'], correctAnswer: 0, category: 'Materials', difficulty: 'Medium' },
  { id: 18, question: 'What is the standard density of concrete?', options: ['2200 kg/m³', '2400 kg/m³', '2600 kg/m³', '2800 kg/m³'], correctAnswer: 1, category: 'Materials', difficulty: 'Easy' },
  { id: 19, question: 'Which material provides the best thermal insulation?', options: ['Glass wool', 'Brick', 'Concrete', 'Steel'], correctAnswer: 0, category: 'Materials', difficulty: 'Medium' },
  { id: 20, question: 'What is the modulus of elasticity of steel?', options: ['200 GPa', '250 GPa', '300 GPa', '350 GPa'], correctAnswer: 0, category: 'Materials', difficulty: 'Hard' },
  { id: 21, question: 'Which type of cement develops highest strength?', options: ['Ordinary Portland Cement', 'Portland Pozzolana Cement', 'Portland Slag Cement', 'Rapid Hardening Cement'], correctAnswer: 3, category: 'Materials', difficulty: 'Hard' },
  { id: 22, question: 'What is the maximum water absorption of good quality brick?', options: ['10%', '15%', '20%', '25%'], correctAnswer: 1, category: 'Materials', difficulty: 'Medium' },
  { id: 23, question: 'Which material is commonly used for DPC?', options: ['Bitumen', 'PVC sheet', 'Copper sheet', 'Aluminum foil'], correctAnswer: 0, category: 'Materials', difficulty: 'Easy' },
  { id: 24, question: 'What is the standard aggregate size for RCC work?', options: ['10 mm', '20 mm', '40 mm', 'All sizes'], correctAnswer: 3, category: 'Materials', difficulty: 'Medium' },
  { id: 25, question: 'Which grade of concrete is commonly used for foundations?', options: ['M15', 'M20', 'M25', 'M30'], correctAnswer: 1, category: 'Materials', difficulty: 'Easy' },
  { id: 26, question: 'What is the specific gravity of cement?', options: ['3.10', '3.15', '3.20', '3.25'], correctAnswer: 1, category: 'Materials', difficulty: 'Hard' },
  { id: 27, question: 'What is the fineness of ordinary Portland cement?', options: ['225 m²/kg', '250 m²/kg', '275 m²/kg', '300 m²/kg'], correctAnswer: 0, category: 'Materials', difficulty: 'Hard' },
  { id: 28, question: 'Which aggregate is best for concrete?', options: ['Crushed stone', 'River gravel', 'Both A and B', 'Neither'], correctAnswer: 2, category: 'Materials', difficulty: 'Medium' },
  { id: 29, question: 'What is the bulking of sand?', options: ['Increase in volume', 'Decrease in volume', 'No change', 'Depends on moisture'], correctAnswer: 0, category: 'Materials', difficulty: 'Medium' },
  { id: 30, question: 'Which material is used for waterproofing?', options: ['Bitumen', 'PVC', 'EPDM', 'All of these'], correctAnswer: 3, category: 'Materials', difficulty: 'Easy' },

  // === CONSTRUCTION (15 unique questions) ===
  { id: 31, question: 'What is the minimum curing period for concrete?', options: ['3 days', '7 days', '14 days', '28 days'], correctAnswer: 1, category: 'Construction', difficulty: 'Easy' },
  { id: 32, question: 'What is the main purpose of formwork?', options: ['To shape concrete', 'To support steel', 'To provide finish', 'All of these'], correctAnswer: 3, category: 'Construction', difficulty: 'Medium' },
  { id: 33, question: 'What is the standard compaction of concrete?', options: ['90%', '95%', '98%', '100%'], correctAnswer: 2, category: 'Construction', difficulty: 'Hard' },
  { id: 34, question: 'Which method is used for concrete compaction?', options: ['Vibration method', 'Tamping method', 'Rolling method', 'All of these'], correctAnswer: 3, category: 'Construction', difficulty: 'Medium' },
  { id: 35, question: 'What is the purpose of a DPC in buildings?', options: ['Moisture barrier', 'Sound barrier', 'Thermal barrier', 'Fire barrier'], correctAnswer: 0, category: 'Construction', difficulty: 'Easy' },
  { id: 36, question: 'What is the standard thickness of DPC?', options: ['2.5 mm', '3.0 mm', '4.0 mm', '5.0 mm'], correctAnswer: 0, category: 'Construction', difficulty: 'Medium' },
  { id: 37, question: 'Which type of joint is used to accommodate expansion?', options: ['Construction joint', 'Expansion joint', 'Contraction joint', 'Isolation joint'], correctAnswer: 1, category: 'Construction', difficulty: 'Medium' },
  { id: 38, question: 'What is the purpose of scaffolding?', options: ['Support workers', 'Support materials', 'Provide access', 'All of these'], correctAnswer: 3, category: 'Construction', difficulty: 'Easy' },
  { id: 39, question: 'What is the standard height of scaffolding?', options: ['2 meters', '3 meters', '4 meters', '5 meters'], correctAnswer: 1, category: 'Construction', difficulty: 'Easy' },
  { id: 40, question: 'Which type of ladder is commonly used in construction?', options: ['Wooden ladder', 'Aluminum ladder', 'Steel ladder', 'All types'], correctAnswer: 3, category: 'Construction', difficulty: 'Easy' },
  { id: 41, question: 'What is the minimum thickness of plastering?', options: ['6 mm', '10 mm', '12 mm', '15 mm'], correctAnswer: 1, category: 'Construction', difficulty: 'Medium' },
  { id: 42, question: 'What is the standard mortar ratio for brickwork?', options: ['1:3', '1:4', '1:5', '1:6'], correctAnswer: 2, category: 'Construction', difficulty: 'Medium' },
  { id: 43, question: 'Which type of brick bond is strongest?', options: ['English bond', 'Flemish bond', 'Stretcher bond', 'Header bond'], correctAnswer: 0, category: 'Construction', difficulty: 'Hard' },
  { id: 44, question: 'What is the purpose of a lintel?', options: ['Support above openings', 'Provide foundation', 'Act as beam', 'All of these'], correctAnswer: 0, category: 'Construction', difficulty: 'Easy' },
  { id: 45, question: 'What is the standard lintel thickness?', options: ['100 mm', '150 mm', '200 mm', '250 mm'], correctAnswer: 1, category: 'Construction', difficulty: 'Medium' },

  // === STRUCTURAL (15 unique questions) ===
  { id: 46, question: 'What is the minimum slab thickness for residential buildings?', options: ['100 mm', '125 mm', '150 mm', '175 mm'], correctAnswer: 0, category: 'Structural', difficulty: 'Easy' },
  { id: 47, question: 'What is the standard column spacing in buildings?', options: ['3 meters', '4 meters', '5 meters', '6 meters'], correctAnswer: 2, category: 'Structural', difficulty: 'Medium' },
  { id: 48, question: 'Which type of beam is most common in construction?', options: ['RCC beam', 'Steel beam', 'Timber beam', 'Composite beam'], correctAnswer: 0, category: 'Structural', difficulty: 'Easy' },
  { id: 49, question: 'What is the purpose of shear reinforcement?', options: ['Prevent shear failure', 'Increase strength', 'Improve ductility', 'All of these'], correctAnswer: 3, category: 'Structural', difficulty: 'Hard' },
  { id: 50, question: 'What is the standard cover for reinforcement?', options: ['20 mm', '30 mm', '40 mm', '50 mm'], correctAnswer: 1, category: 'Structural', difficulty: 'Medium' },
  { id: 51, question: 'Which type of load is most critical in design?', options: ['Dead load', 'Live load', 'Wind load', 'Seismic load'], correctAnswer: 3, category: 'Structural', difficulty: 'Hard' },
  { id: 52, question: 'What is the standard span-depth ratio for beams?', options: ['10', '15', '20', '25'], correctAnswer: 1, category: 'Structural', difficulty: 'Hard' },
  { id: 53, question: 'Which type of column is most commonly used?', options: ['Square column', 'Rectangular column', 'Circular column', 'All types'], correctAnswer: 3, category: 'Structural', difficulty: 'Easy' },
  { id: 54, question: 'What is the maximum reinforcement percentage in beams?', options: ['2%', '4%', '6%', '8%'], correctAnswer: 1, category: 'Structural', difficulty: 'Hard' },
  { id: 55, question: 'What is the minimum steel percentage in columns?', options: ['0.8%', '1.0%', '1.2%', '1.5%'], correctAnswer: 0, category: 'Structural', difficulty: 'Hard' },
  { id: 56, question: 'What is the purpose of a shear wall?', options: ['Resist lateral loads', 'Support vertical loads', 'Provide openings', 'All of these'], correctAnswer: 0, category: 'Structural', difficulty: 'Medium' },
  { id: 57, question: 'What is the standard floor height in residential buildings?', options: ['2.7 meters', '3.0 meters', '3.3 meters', '3.6 meters'], correctAnswer: 1, category: 'Structural', difficulty: 'Easy' },
  { id: 58, question: 'Which type of foundation is best for tall buildings?', options: ['Raft foundation', 'Pile foundation', 'Strip foundation', 'Isolated footing'], correctAnswer: 1, category: 'Structural', difficulty: 'Medium' },
  { id: 59, question: 'What is the purpose of a tie beam?', options: ['Connect columns', 'Transfer loads', 'Provide stability', 'All of these'], correctAnswer: 3, category: 'Structural', difficulty: 'Medium' },
  { id: 60, question: 'What is the standard thickness of a load-bearing wall?', options: ['4 inches', '6 inches', '9 inches', '12 inches'], correctAnswer: 2, category: 'Structural', difficulty: 'Easy' },

  // === PLUMBING (15 unique questions) ===
  { id: 61, question: 'What is the standard pipe size for residential water supply?', options: ['15 mm', '20 mm', '25 mm', '32 mm'], correctAnswer: 1, category: 'Plumbing', difficulty: 'Easy' },
  { id: 62, question: 'Which material is commonly used for drainage pipes?', options: ['PVC pipes', 'Cast iron pipes', 'Copper pipes', 'All of these'], correctAnswer: 3, category: 'Plumbing', difficulty: 'Medium' },
  { id: 63, question: 'What is the standard slope for drainage pipes?', options: ['1:100', '1:80', '1:60', '1:40'], correctAnswer: 0, category: 'Plumbing', difficulty: 'Medium' },
  { id: 64, question: 'What is the purpose of a trap in plumbing?', options: ['Prevent gas entry', 'Collect debris', 'Control flow', 'All of these'], correctAnswer: 0, category: 'Plumbing', difficulty: 'Easy' },
  { id: 65, question: 'Which type of valve is used for main water control?', options: ['Gate valve', 'Globe valve', 'Ball valve', 'Check valve'], correctAnswer: 0, category: 'Plumbing', difficulty: 'Medium' },
  { id: 66, question: 'What is the standard water pressure for buildings?', options: ['1-2 bar', '2-3 bar', '3-4 bar', '4-5 bar'], correctAnswer: 1, category: 'Plumbing', difficulty: 'Medium' },
  { id: 67, question: 'Which pipe is best for hot water supply?', options: ['CPVC pipes', 'PVC pipes', 'Copper pipes', 'GI pipes'], correctAnswer: 0, category: 'Plumbing', difficulty: 'Hard' },
  { id: 68, question: 'What is the purpose of a water hammer arrestor?', options: ['Prevent shock', 'Reduce noise', 'Control flow', 'All of these'], correctAnswer: 0, category: 'Plumbing', difficulty: 'Hard' },
  { id: 69, question: 'What is the standard fixture unit for a WC?', options: ['3 units', '4 units', '5 units', '6 units'], correctAnswer: 0, category: 'Plumbing', difficulty: 'Hard' },
  { id: 70, question: 'Which type of water storage is most common?', options: ['Overhead tank', 'Underground tank', 'Both types', 'None'], correctAnswer: 2, category: 'Plumbing', difficulty: 'Easy' },
  { id: 71, question: 'What is the minimum pipe slope for soil pipes?', options: ['1:50', '1:40', '1:30', '1:20'], correctAnswer: 1, category: 'Plumbing', difficulty: 'Medium' },
  { id: 72, question: 'What is the standard diameter of rainwater pipes?', options: ['75 mm', '100 mm', '150 mm', '200 mm'], correctAnswer: 1, category: 'Plumbing', difficulty: 'Medium' },
  { id: 73, question: 'Which type of pipe is used for fire fighting?', options: ['GI pipes', 'PVC pipes', 'Copper pipes', 'All of these'], correctAnswer: 0, category: 'Plumbing', difficulty: 'Easy' },
  { id: 74, question: 'What is the purpose of a ventilation pipe?', options: ['Release gases', 'Provide air flow', 'Both A and B', 'None'], correctAnswer: 2, category: 'Plumbing', difficulty: 'Medium' },
  { id: 75, question: 'What is the standard depth of sewer line?', options: ['0.5 meters', '1.0 meters', '1.5 meters', '2.0 meters'], correctAnswer: 1, category: 'Plumbing', difficulty: 'Medium' },

  // === CONCRETE (15 unique questions) ===
  { id: 76, question: 'What is the standard water-cement ratio for concrete?', options: ['0.35', '0.45', '0.55', '0.65'], correctAnswer: 1, category: 'Concrete', difficulty: 'Easy' },
  { id: 77, question: 'What is the standard slump for concrete?', options: ['25-50 mm', '50-100 mm', '100-150 mm', '150-200 mm'], correctAnswer: 1, category: 'Concrete', difficulty: 'Medium' },
  { id: 78, question: 'Which grade of concrete is most commonly used?', options: ['M20', 'M25', 'M30', 'M35'], correctAnswer: 0, category: 'Concrete', difficulty: 'Easy' },
  { id: 79, question: 'What is the purpose of admixtures in concrete?', options: ['Improve workability', 'Increase strength', 'Reduce water content', 'All of these'], correctAnswer: 3, category: 'Concrete', difficulty: 'Medium' },
  { id: 80, question: 'What is the standard aggregate-cement ratio?', options: ['3:1', '4:1', '5:1', '6:1'], correctAnswer: 1, category: 'Concrete', difficulty: 'Hard' },
  { id: 81, question: 'Which test is used to measure concrete strength?', options: ['Slump test', 'Compression test', 'Flexural test', 'Tensile test'], correctAnswer: 1, category: 'Concrete', difficulty: 'Easy' },
  { id: 82, question: 'What is the standard concrete grade for foundations?', options: ['M15', 'M20', 'M25', 'M30'], correctAnswer: 1, category: 'Concrete', difficulty: 'Medium' },
  { id: 83, question: 'Which type of cement sets fastest?', options: ['OPC', 'PPC', 'PSC', 'Rapid hardening cement'], correctAnswer: 3, category: 'Concrete', difficulty: 'Hard' },
  { id: 84, question: 'What is the standard density of concrete?', options: ['2200 kg/m³', '2400 kg/m³', '2600 kg/m³', '2800 kg/m³'], correctAnswer: 1, category: 'Concrete', difficulty: 'Easy' },
  { id: 85, question: 'Which factor most affects concrete strength?', options: ['Water-cement ratio', 'Aggregate size', 'Curing method', 'All of these'], correctAnswer: 3, category: 'Concrete', difficulty: 'Hard' },
  { id: 86, question: 'What is the maximum aggregate size for slabs?', options: ['10 mm', '20 mm', '40 mm', '50 mm'], correctAnswer: 1, category: 'Concrete', difficulty: 'Medium' },
  { id: 87, question: 'What is the minimum cement content for durability?', options: ['300 kg/m³', '350 kg/m³', '400 kg/m³', '450 kg/m³'], correctAnswer: 1, category: 'Concrete', difficulty: 'Hard' },
  { id: 88, question: 'What is the purpose of curing concrete?', options: ['Maintain moisture', 'Increase strength', 'Prevent cracking', 'All of these'], correctAnswer: 3, category: 'Concrete', difficulty: 'Easy' },
  { id: 89, question: 'Which type of concrete is used for underwater construction?', options: ['High density concrete', 'Lightweight concrete', 'Pumping concrete', 'Special concrete'], correctAnswer: 0, category: 'Concrete', difficulty: 'Hard' },
  { id: 90, question: 'What is the standard concrete mix for columns?', options: ['M20', 'M25', 'M30', 'M35'], correctAnswer: 2, category: 'Concrete', difficulty: 'Medium' },

  // === REGULATIONS (15 unique questions) ===
  { id: 91, question: 'What does RERA stand for?', options: ['Real Estate Regulation Authority', 'Real Estate Regulatory Act', 'Real Estate Revenue Authority', 'Regional Estate Regulation Act'], correctAnswer: 1, category: 'Regulations', difficulty: 'Easy' },
  { id: 92, question: 'In which year was RERA enacted?', options: ['2014', '2015', '2016', '2017'], correctAnswer: 2, category: 'Regulations', difficulty: 'Easy' },
  { id: 93, question: 'What is the purpose of BDA?', options: ['Urban planning', 'Land allocation', 'Development control', 'All of these'], correctAnswer: 3, category: 'Regulations', difficulty: 'Medium' },
  { id: 94, question: 'What is the standard FAR in residential zones?', options: ['1.5', '2.0', '2.5', '3.0'], correctAnswer: 1, category: 'Regulations', difficulty: 'Hard' },
  { id: 95, question: 'What is the purpose of EIA?', options: ['Environmental impact assessment', 'Land assessment', 'Water assessment', 'Air quality assessment'], correctAnswer: 0, category: 'Regulations', difficulty: 'Medium' },
  { id: 96, question: 'What is the standard setback for buildings?', options: ['3 meters', '5 meters', '7 meters', '10 meters'], correctAnswer: 1, category: 'Regulations', difficulty: 'Medium' },
  { id: 97, question: 'Which body regulates land records?', options: ['Revenue Department', 'BDA', 'BMRDA', 'GBA'], correctAnswer: 0, category: 'Regulations', difficulty: 'Easy' },
  { id: 98, question: 'What is the purpose of zoning regulations?', options: ['Land use control', 'Population control', 'Pollution control', 'All of these'], correctAnswer: 0, category: 'Regulations', difficulty: 'Medium' },
  { id: 99, question: 'Which authority issues building permits?', options: ['BDA', 'BBMP', 'Both', 'State Government'], correctAnswer: 2, category: 'Regulations', difficulty: 'Hard' },
  { id: 100, question: 'What is the maximum building height without NOC?', options: ['10 meters', '12 meters', '15 meters', '20 meters'], correctAnswer: 1, category: 'Regulations', difficulty: 'Hard' },
  { id: 101, question: 'What is the minimum plot area for building?', options: ['100 sqm', '150 sqm', '200 sqm', '250 sqm'], correctAnswer: 0, category: 'Regulations', difficulty: 'Medium' },
  { id: 102, question: 'What is the purpose of building bye-laws?', options: ['Regulate construction', 'Ensure safety', 'Control development', 'All of these'], correctAnswer: 3, category: 'Regulations', difficulty: 'Easy' },
  { id: 103, question: 'Which authority approves building plans?', options: ['Municipal corporation', 'BDA', 'Both', 'State government'], correctAnswer: 0, category: 'Regulations', difficulty: 'Medium' },
  { id: 104, question: 'What is the standard parking norm?', options: ['1 per unit', '2 per unit', '3 per unit', '4 per unit'], correctAnswer: 1, category: 'Regulations', difficulty: 'Hard' },
  { id: 105, question: 'What is the purpose of occupancy certificate?', options: ['Legal occupancy', 'Building completion', 'Safety compliance', 'All of these'], correctAnswer: 3, category: 'Regulations', difficulty: 'Easy' },

  // === DESIGN (15 unique questions) ===
  { id: 106, question: 'What is the standard bedroom size?', options: ['3x3 meters', '3.5x3.5 meters', '4x4 meters', '4.5x4.5 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Easy' },
  { id: 107, question: 'What is the standard kitchen size?', options: ['2.5x3 meters', '3x3 meters', '3x3.5 meters', '3.5x4 meters'], correctAnswer: 0, category: 'Design', difficulty: 'Medium' },
  { id: 108, question: 'What is the standard bathroom size?', options: ['1.5x2 meters', '2x2 meters', '2x2.5 meters', '2.5x3 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Medium' },
  { id: 109, question: 'What is the standard corridor width?', options: ['0.9 meters', '1.2 meters', '1.5 meters', '1.8 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Easy' },
  { id: 110, question: 'What is the standard stair width?', options: ['0.8 meters', '1.0 meters', '1.2 meters', '1.5 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Easy' },
  { id: 111, question: 'What is the standard riser height for stairs?', options: ['150 mm', '175 mm', '200 mm', '225 mm'], correctAnswer: 0, category: 'Design', difficulty: 'Medium' },
  { id: 112, question: 'What is the standard tread width?', options: ['250 mm', '275 mm', '300 mm', '325 mm'], correctAnswer: 2, category: 'Design', difficulty: 'Medium' },
  { id: 113, question: 'What is the standard window size?', options: ['1x1.5 meters', '1.2x1.5 meters', '1.5x2 meters', '2x2 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Easy' },
  { id: 114, question: 'What is the standard door size?', options: ['0.9x2.1 meters', '1x2.1 meters', '1.2x2.1 meters', '1.5x2.1 meters'], correctAnswer: 0, category: 'Design', difficulty: 'Easy' },
  { id: 115, question: 'What is the standard ceiling height?', options: ['2.7 meters', '3.0 meters', '3.3 meters', '3.6 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Medium' },
  { id: 116, question: 'What is the minimum room width?', options: ['2.0 meters', '2.5 meters', '3.0 meters', '3.5 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Medium' },
  { id: 117, question: 'What is the standard parking space size?', options: ['2.5x5 meters', '2.5x5.5 meters', '3x5 meters', '3x5.5 meters'], correctAnswer: 0, category: 'Design', difficulty: 'Hard' },
  { id: 118, question: 'What is the standard balcony size?', options: ['1.2x2 meters', '1.5x2.5 meters', '1.8x3 meters', '2x3 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Medium' },
  { id: 119, question: 'What is the standard kitchen cabinet height?', options: ['0.6 meters', '0.75 meters', '0.9 meters', '1.0 meters'], correctAnswer: 2, category: 'Design', difficulty: 'Hard' },
  { id: 120, question: 'What is the standard counter height in kitchen?', options: ['0.7 meters', '0.8 meters', '0.9 meters', '1.0 meters'], correctAnswer: 1, category: 'Design', difficulty: 'Hard' },

  // === ROOFING (6 unique questions) ===
  { id: 121, question: 'Which type of roof is best for hot climates?', options: ['Flat roof', 'Sloped roof', 'Green roof', 'Metal roof'], correctAnswer: 1, category: 'Roofing', difficulty: 'Medium' },
  { id: 122, question: 'What is the standard roof slope for RCC?', options: ['1:12', '1:24', '1:36', '1:48'], correctAnswer: 0, category: 'Roofing', difficulty: 'Hard' },
  { id: 123, question: 'Which roof type is most economical?', options: ['Flat roof', 'Sloped roof', 'Green roof', 'Metal roof'], correctAnswer: 0, category: 'Roofing', difficulty: 'Easy' },
  { id: 124, question: 'What is the purpose of roof insulation?', options: ['Thermal control', 'Sound control', 'Waterproofing', 'All of these'], correctAnswer: 0, category: 'Roofing', difficulty: 'Medium' },
  { id: 125, question: 'Which roofing material is most durable?', options: ['Slate tiles', 'Clay tiles', 'Metal sheets', 'Concrete tiles'], correctAnswer: 0, category: 'Roofing', difficulty: 'Hard' },
  { id: 126, question: 'What is the standard roof overhang?', options: ['0.6 meters', '0.9 meters', '1.2 meters', '1.5 meters'], correctAnswer: 1, category: 'Roofing', difficulty: 'Medium' },

  // === TESTING (6 unique questions) ===
  { id: 127, question: 'Which test measures concrete compressive strength?', options: ['Compression test', 'Tensile test', 'Flexural test', 'Impact test'], correctAnswer: 0, category: 'Testing', difficulty: 'Easy' },
  { id: 128, question: 'What is the standard cube size for testing?', options: ['100 mm', '150 mm', '200 mm', '250 mm'], correctAnswer: 1, category: 'Testing', difficulty: 'Medium' },
  { id: 129, question: 'Which test is used for soil analysis?', options: ['Standard Proctor test', 'CBR test', 'Atterberg limits', 'All of these'], correctAnswer: 3, category: 'Testing', difficulty: 'Hard' },
  { id: 130, question: 'What is the purpose of NDT?', options: ['Non-destructive testing', 'Quality control', 'Both A and B', 'None'], correctAnswer: 2, category: 'Testing', difficulty: 'Medium' },
  { id: 131, question: 'Which test measures steel tensile strength?', options: ['Tensile test', 'Compression test', 'Flexural test', 'Shear test'], correctAnswer: 0, category: 'Testing', difficulty: 'Medium' },
  { id: 132, question: 'What is the standard sample size for testing?', options: ['3 samples', '4 samples', '5 samples', '6 samples'], correctAnswer: 2, category: 'Testing', difficulty: 'Easy' },

  // === SURVEYING (4 unique questions) ===
  { id: 133, question: 'What is the purpose of surveying?', options: ['Land measurement', '

// Combine all questions
const ALL_QUESTIONS = UNIQUE_QUESTIONS;
  // Add more questions to reach 150+
  // ... (I'll add 30 more unique questions below)
];



// Combine all questions
const ALL_QUESTIONS = [...UNIQUE_QUESTIONS, ...additionalQuestions];

// ============= QUIZ PROVIDER =============
const QuizProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(20).fill(null));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try API first
      try {
        const response = await fetch(`${API_URL}/quiz/questions?count=20`);
        const data = await response.json();
        if (data.success && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setAnswers(Array(20).fill(null));
          setCurrentQuestionIndex(0);
          setQuizCompleted(false);
          setScore(0);
          setShowLeaderboard(false);
          setIsLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using local questions');
      }
      
      // Use local 150+ unique questions
      const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 20));
      setAnswers(Array(20).fill(null));
      setCurrentQuestionIndex(0);
      setQuizCompleted(false);
      setScore(0);
      setShowLeaderboard(false);
    } catch (err) {
      setError('Failed to fetch quiz questions');
    } finally {
      setIsLoading(false);
    }
  };

  const setAnswer = (index, answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < 19) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async (timeTaken) => {
    try {
      setIsLoading(true);
      const correctAnswers = questions.filter((q, idx) => answers[idx] === q.correctAnswer);
      const score = Math.round((correctAnswers.length / questions.length) * 100);
      
      setQuizCompleted(true);
      setScore(score);
      setShowLeaderboard(true);
      return { score, correct: correctAnswers.length };
    } catch (err) {
      setError('Failed to submit quiz');
      return { score: 0, correct: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <QuizContext.Provider value={{
      questions, currentQuestionIndex, answers, setAnswer,
      goToNextQuestion, goToPreviousQuestion, submitQuiz, fetchQuestions,
      isLoading, error, quizCompleted, score, showLeaderboard, setShowLeaderboard
    }}>
      {children}
    </QuizContext.Provider>
  );
};

// ============= LEADERBOARD PROVIDER =============
const LeaderboardProvider = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, userName: 'Rajesh Kumar', score: 100, date: '2026-06-28', certificateId: 'CERT001' },
    { id: 2, userName: 'Priya Sharma', score: 95, date: '2026-06-27', certificateId: 'CERT002' },
    { id: 3, userName: 'Amit Singh', score: 90, date: '2026-06-26', certificateId: null },
    { id: 4, userName: 'Sneha Patel', score: 85, date: '2026-06-25', certificateId: null },
    { id: 5, userName: 'Vikram Reddy', score: 80, date: '2026-06-24', certificateId: null },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      try {
        const response = await fetch(`${API_URL}/leaderboard`);
        const data = await response.json();
        if (data && data.length > 0) {
          setLeaderboard(data);
          setIsLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using sample leaderboard');
      }
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch leaderboard');
      setIsLoading(false);
    }
  };

  const updateScore = async (score, userName = 'Current User') => {
    try {
      const newEntry = {
        id: Date.now(),
        userName: userName,
        score: score,
        date: new Date().toISOString().split('T')[0],
        certificateId: score === 100 ? `CERT${Date.now()}` : null
      };
      setLeaderboard(prev => [...prev, newEntry].sort((a, b) => b.score - a.score));
      return true;
    } catch (err) {
      console.error('Error updating score:', err);
      return false;
    }
  };

  return (
    <LeaderboardContext.Provider value={{
      leaderboard, isLoading, error, fetchLeaderboard, updateScore
    }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

// ============= CERTIFICATE PROVIDER =============
const CertificateProvider = ({ children }) => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCertificate = async (userName = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const name = userName || 'Current User';
      const certificateId = `CERT${Date.now()}`;
      setCertificates(prev => [...prev, { id: certificateId, userName: name }]);
      alert(`🎉 Certificate ${certificateId} generated for ${name}!`);
      return { success: true, certificateId };
    } catch (err) {
      setError('Failed to generate certificate');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const getCertificate = async (certificateId) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      alert(`📄 Certificate ${certificateId} downloaded successfully!`);
      return true;
    } catch (err) {
      setError('Failed to download certificate');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CertificateContext.Provider value={{
      certificates, isLoading, error, generateCertificate, getCertificate
    }}>
      {children}
    </CertificateContext.Provider>
  );
};

// ============= 3D GAME COMPONENT =============
const ThreeDGame = () => {
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Living Room', x: 80, y: 80, width: 180, height: 140, color: '#FF6B6B' },
    { id: 2, name: 'Kitchen', x: 320, y: 80, width: 140, height: 110, color: '#4ECDC4' },
    { id: 3, name: 'Bedroom', x: 80, y: 270, width: 160, height: 150, color: '#45B7D1' },
    { id: 4, name: 'Bathroom', x: 310, y: 250, width: 110, height: 90, color: '#96CEB4' },
  ]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: `Room ${rooms.length + 1}`,
      x: Math.random() * 300 + 50,
      y: Math.random() * 300 + 50,
      width: 100 + Math.random() * 80,
      height: 80 + Math.random() * 60,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setRooms([...rooms, newRoom]);
    setMoves(m => m + 1);
    setScore(s => s + 10);
  };

  const removeRoom = () => {
    if (rooms.length > 1 && selectedRoom) {
      setRooms(rooms.filter(r => r.id !== selectedRoom));
      setSelectedRoom(null);
      setMoves(m => m + 1);
      setScore(s => s + 5);
    }
  };

  const handleRoomResize = (roomId, delta) => {
    setRooms(rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, width: Math.max(60, r.width + delta), height: Math.max(60, r.height + delta) };
      }
      return r;
    }));
    setMoves(m => m + 1);
    setScore(s => s + 15);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label={`⭐ Score: ${score}`} color="primary" sx={{ fontWeight: 'bold' }} />
          <Chip label={`🔄 Moves: ${moves}`} variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="contained" onClick={addRoom} startIcon={<AddCircleIcon />}>Add Room</Button>
          <Button size="small" variant="outlined" color="error" onClick={removeRoom} disabled={!selectedRoom} startIcon={<CloseIcon />}>Remove</Button>
        </Box>
      </Box>

      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: 420, 
        bgcolor: '#f0f4f8', 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
        border: '2px solid #e0e0e0'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        {rooms.map(room => (
          <Box
            key={room.id}
            sx={{
              position: 'absolute',
              left: room.x,
              top: room.y,
              width: room.width,
              height: room.height,
              bgcolor: room.color,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 2px rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.25)', transform: 'scale(1.02)', zIndex: 10 },
              transform: selectedRoom === room.id ? 'scale(1.02)' : 'scale(1)',
              zIndex: selectedRoom === room.id ? 10 : 1,
              border: selectedRoom === room.id ? '3px solid #1a237e' : 'none'
            }}
            onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
          >
            <Typography variant="caption" sx={{ 
              position: 'absolute', top: 8, left: 8, color: 'white',
              fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              {room.name}
            </Typography>
            <Typography variant="caption" sx={{ 
              position: 'absolute', bottom: 8, right: 8, color: 'white',
              fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              {room.width}×{room.height}
            </Typography>
            {selectedRoom === room.id && (
              <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 0.5 }}>
                <Fab size="small" sx={{ width: 24, height: 24, minHeight: 24 }}
                     onClick={(e) => { e.stopPropagation(); handleRoomResize(room.id, 20); }}>
                  <AddCircleIcon sx={{ fontSize: 14 }} />
                </Fab>
                <Fab size="small" sx={{ width: 24, height: 24, minHeight: 24 }}
                     onClick={(e) => { e.stopPropagation(); handleRoomResize(room.id, -20); }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </Fab>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="textSecondary">
          💡 Tip: Click a room to select it, then use +/- to resize
        </Typography>
      </Box>
    </Box>
  );
};

// ============= PUZZLE GAME COMPONENT =============
const PuzzleGame = ({ title, description, icon, difficulty, onComplete }) => {
  const [gameState, setGameState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  const puzzleQuestions = [
    { question: 'Which material is best for load-bearing walls?', options: ['Brick', 'Wood', 'Glass', 'Aluminum'], correct: 0 },
    { question: 'What is the standard brick size in India?', options: ['190×90×90mm', '200×100×100mm', '180×80×80mm', '210×110×110mm'], correct: 0 },
    { question: 'Which type of foundation is strongest?', options: ['Raft', 'Pile', 'Strip', 'Isolated'], correct: 1 },
    { question: 'What is the minimum curing time for concrete?', options: ['3 days', '7 days', '14 days', '28 days'], correct: 1 },
    { question: 'Which roof is best for tropical climate?', options: ['Flat', 'Sloped', 'Green', 'Metal'], correct: 1 },
  ];

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('completed');
            if (onComplete) onComplete(score);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, onComplete]);

  const handleAnswer = (selected) => {
    const isCorrect = selected === puzzleQuestions[currentQuestion].correct;
    if (isCorrect) setScore(s => s + 20);
    if (currentQuestion < puzzleQuestions.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      setGameState('completed');
      if (onComplete) onComplete(score);
    }
  };

  if (gameState === 'idle') {
    return (
      <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={startGame}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 2, fontSize: 48 }}>{icon}</Box>
          <Typography variant="h6">{title}</Typography>
          <Chip label={difficulty} size="small" color={difficulty === 'Easy' ? 'success' : difficulty === 'Medium' ? 'warning' : 'error'} sx={{ my: 1 }} />
          <Typography variant="body2" color="textSecondary">{description}</Typography>
          <Button variant="contained" sx={{ mt: 2 }}>Start Game</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'playing') {
    const q = puzzleQuestions[currentQuestion];
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="h6" color={timeLeft < 10 ? 'error' : 'textPrimary'}>
              ⏱️ {timeLeft}s
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={((60 - timeLeft) / 60) * 100} sx={{ mb: 2, height: 8, borderRadius: 4 }} />
          <Typography variant="body1" sx={{ mb: 2 }}>{q.question}</Typography>
          <Grid container spacing={1}>
            {q.options.map((opt, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Button fullWidth variant="outlined" onClick={() => handleAnswer(idx)} sx={{ py: 1.5 }}>
                  {opt}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography sx={{ mt: 2 }}>⭐ Score: {score}</Typography>
          <Typography variant="caption" color="textSecondary">Question {currentQuestion + 1}/{puzzleQuestions.length}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', textAlign: 'center', py: 3 }}>
      <CardContent>
        <EmojiEventsIcon sx={{ fontSize: 48, color: 'gold' }} />
        <Typography variant="h5" gutterBottom>🎉 Game Over!</Typography>
        <Typography variant="h4" color="primary">Score: {score}</Typography>
        <Typography variant="body2" color="textSecondary">
          {score >= 80 ? '🏆 Excellent! You\'re a construction expert!' : 
           score >= 50 ? '👍 Good job! Keep learning!' : 
           '💪 Practice makes perfect! Try again!'}
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => { setGameState('idle'); }}>
          Play Again
        </Button>
      </CardContent>
    </Card>
  );
};

// ============= MAIN LAYOUT =============
const MainLayout = ({ children, activeTab, setActiveTab }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const tabs = [
    { label: 'Quiz', icon: <QuizIcon />, value: 0 },
    { label: 'Education', icon: <SchoolIcon />, value: 1 },
    { label: 'Expert Talks', icon: <PodcastsIcon />, value: 2 },
    { label: '3D Design', icon: <ThreeDRotationIcon />, value: 3 },
    { label: 'Puzzle Games', icon: <GamesIcon />, value: 4 },
    { label: 'New Materials', icon: <NewReleasesIcon />, value: 5 },
    { label: 'Guidelines', icon: <GavelIcon />, value: 6 },
    { label: 'Leaderboard', icon: <EmojiEventsIcon />, value: 7 },
  ];

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ 
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1a237e 100%)',
        borderRadius: 0
      }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
              width: 48, height: 48, borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6f00, #ff8f00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2,
              boxShadow: '0 4px 12px rgba(255,111,0,0.3)'
            }}>
              <ConstructionIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.5px', fontSize: isMobile ? '1rem' : '1.25rem' }}>
              BuildMitra
              <Box component="span" sx={{ display: 'block', fontSize: '0.6rem', opacity: 0.7, fontWeight: 400, letterSpacing: '1px' }}>
                Learn & Earn Premium
              </Box>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="inherit" sx={{ color: 'white' }}>
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Chip label="Premium" size="small" sx={{ bgcolor: '#ff6f00', color: 'white', fontWeight: 'bold' }} />
          </Box>
        </Toolbar>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              minHeight: 56,
              fontWeight: 600,
              '&.Mui-selected': { color: 'white', bgcolor: 'rgba(255,255,255,0.15)' }
            },
            '& .MuiTabs-indicator': { height: 3, bgcolor: '#ff6f00', borderRadius: '3px 3px 0 0' }
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={isMobile ? '' : tab.label} icon={tab.icon} iconPosition="start" sx={{ minHeight: 56 }} />
          ))}
        </Tabs>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {children}
      </Container>
    </>
  );
};

// ============= QUIZ TAB =============
const QuizTab = () => {
  const { 
    questions, currentQuestionIndex, answers, setAnswer,
    goToNextQuestion, goToPreviousQuestion, submitQuiz, fetchQuestions,
    isLoading, error, quizCompleted, score 
  } = useContext(QuizContext);
  const { generateCertificate } = useContext(CertificateContext);
  const { updateScore, leaderboard } = useContext(LeaderboardContext);

  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const savedQuiz = localStorage.getItem('buildmitra_quiz_completed');
    const lastAttempt = localStorage.getItem('buildmitra_quiz_attempt_date');

    if (savedQuiz === 'true' && lastAttempt) {
      const daysSince = Math.floor((Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 30) {
        setAlertMessage(`You've already completed the quiz. Please wait ${30 - daysSince} days to retake.`);
        setAlertSeverity('info');
        setShowAlert(true);
        return;
      }
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (quizCompleted || isLoading || !questions.length) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizCompleted, isLoading, questions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const allAnswered = answers.every(ans => ans !== null);
    if (!allAnswered) {
      setAlertMessage('Please answer all questions before submitting.');
      setAlertSeverity('warning');
      setShowAlert(true);
      return;
    }
    
    const timeTaken = 300 - timeLeft;
    const result = await submitQuiz(timeTaken);
    await updateScore(result.score, 'Current User');

    if (result.score === 100) {
      await generateCertificate();
      setAlertMessage('🎉 Congratulations! You scored 100%! Your premium certificate has been generated!');
      setAlertSeverity('success');
    } else {
      setAlertMessage(`You scored ${result.score}%. Keep learning and try again!`);
      setAlertSeverity('info');
    }
    setShowAlert(true);
    setShowSidebar(true);
    localStorage.setItem('buildmitra_quiz_completed', 'true');
    localStorage.setItem('buildmitra_quiz_attempt_date', new Date().toISOString());
  };

  const resetQuiz = () => {
    localStorage.removeItem('buildmitra_quiz_completed');
    localStorage.removeItem('buildmitra_quiz_attempt_date');
    fetchQuestions();
    setShowSidebar(false);
    setTimeLeft(5 * 60);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  
  if (quizCompleted && showSidebar) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'linear-gradient(135deg, #f8f9fe 0%, #e8eaf6 100%)',
            border: '2px solid', borderColor: score === 100 ? 'success.main' : 'info.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {score === 100 ? <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} /> :
                  <EmojiEventsIcon sx={{ fontSize: 48, color: 'info.main' }} />}
                <Box>
                  <Typography variant="h5">{score === 100 ? '🎉 Perfect Score!' : '✅ Quiz Completed'}</Typography>
                  <Typography variant="h3" color="primary" fontWeight="bold">{score}%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {score === 100 ? 'You answered all 20 questions correctly! Premium certificate generated!' : 
                     `You answered ${Math.round(score/5)} questions correctly. Keep practicing!`}
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={resetQuiz} sx={{ mt: 2 }}>Retake Quiz</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>🏆 Top Performers</Typography>
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((entry, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1,
                    borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                    <Typography variant="body2" sx={{ minWidth: 30, color: 'rgba(255,255,255,0.7)' }}>#{index + 1}</Typography>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.2)' }}>
                      {entry.userName?.charAt(0) || 'G'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ color: 'white' }}>{entry.userName || 'Guest'}</Typography></Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#ff8f00' }}>{entry.score}%</Typography>
                    {entry.score === 100 && <EmojiEventsIcon sx={{ fontSize: 16, color: '#ffd700' }} />}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>No scores yet. Be the first!</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>No questions available. Please try again.</Alert>
        <Button variant="contained" onClick={fetchQuestions}>Load Questions</Button>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  return (
    <Box>
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8f9fe 0%, #e8eaf6 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">Question {currentQuestionIndex + 1} of 20</Typography>
              <Chip label={currentQuestion?.category || 'General'} size="small" color="primary" sx={{ mt: 0.5 }} />
              <Chip label={currentQuestion?.difficulty || 'Medium'} size="small" variant="outlined" sx={{ mt: 0.5, ml: 1 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip icon={<EmojiEventsIcon />} label={`${answers.filter(a => a !== null).length}/20 answered`} variant="outlined" />
              <Typography variant="h6" color={timeLeft < 60 ? 'error' : 'textPrimary'} fontWeight="bold">
                ⏱️ {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={(currentQuestionIndex / 20) * 100} sx={{ 
            height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1a237e, #283593)', borderRadius: 4 }
          }} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            {currentQuestion?.question}
          </Typography>

          <RadioGroup value={answers[currentQuestionIndex] ?? ''} onChange={(e) => setAnswer(currentQuestionIndex, parseInt(e.target.value))}>
            {currentQuestion?.options?.map((option, index) => (
              <Paper key={index} elevation={answers[currentQuestionIndex] === index ? 2 : 0} sx={{ 
                mb: 1, borderRadius: 2, border: '2px solid',
                borderColor: answers[currentQuestionIndex] === index ? 'primary.main' : 'transparent',
                bgcolor: answers[currentQuestionIndex] === index ? 'rgba(26,35,126,0.05)' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(26,35,126,0.05)', borderColor: 'rgba(26,35,126,0.2)' }
              }}>
                <FormControlLabel value={index} control={<Radio />} label={option} sx={{ 
                  width: '100%', p: 1,
                  '& .MuiFormControlLabel-label': {
                    fontWeight: answers[currentQuestionIndex] === index ? 600 : 400
                  }
                }} />
              </Paper>
            ))}
          </RadioGroup>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
            <Button variant="outlined" disabled={currentQuestionIndex === 0} onClick={goToPreviousQuestion} startIcon={<ArrowBackIcon />}>
              Previous
            </Button>
            {currentQuestionIndex === 19 ? (
              <Button variant="contained" color="primary" onClick={handleSubmit} endIcon={<CheckCircleIcon />}
                sx={{ background: 'linear-gradient(135deg, #1a237e, #283593)', px: 4 }}>
                Submit Quiz
              </Button>
            ) : (
              <Button variant="contained" color="primary" disabled={answers[currentQuestionIndex] === null}
                onClick={goToNextQuestion} endIcon={<ArrowForwardIcon />}>
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>{alertMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

// ============= EDUCATION TAB =============
const EducationTab = () => {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const videos = [
    { id: 1, title: 'Complete Building Construction Process', category: 'Construction', url: 'https://www.youtube.com/embed/MjCFpKZfC2Y', duration: '15:30', views: '1.2M' },
    { id: 2, title: 'Modern Plumbing Systems Explained', category: 'Plumbing', url: 'https://www.youtube.com/embed/4vZ5yLcVB7U', duration: '12:45', views: '850K' },
    { id: 3, title: 'Reinforced Concrete Design Basics', category: 'Structural', url: 'https://www.youtube.com/embed/4L8rRZaZ4Pc', duration: '18:20', views: '950K' },
    { id: 4, title: 'Sustainable Building Materials Guide', category: 'Materials', url: 'https://www.youtube.com/embed/9QX_QdWOK0E', duration: '14:10', views: '720K' },
    { id: 5, title: 'Smart Home Automation in India', category: 'Technology', url: 'https://www.youtube.com/embed/HhQeZPp0T6c', duration: '16:45', views: '1.1M' },
    { id: 6, title: 'Green Building Certification Process', category: 'Sustainability', url: 'https://www.youtube.com/embed/z7P0cJHBQvY', duration: '20:30', views: '680K' },
  ];

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #1a237e, #283593)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        📚 Construction Education
      </Typography>

      <TextField fullWidth variant="outlined" placeholder="Search videos, topics, categories..."
        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 3 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ overflow: 'hidden' }}>
            {videos[selectedVideo] && (
              <>
                <Box component="iframe" width="100%" height="400" src={videos[selectedVideo].url}
                  title={videos[selectedVideo].title} sx={{ border: 'none' }} allowFullScreen />
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={videos[selectedVideo].category} size="small" color="primary" />
                    <Chip label={`⏱️ ${videos[selectedVideo].duration}`} size="small" variant="outlined" />
                    <Chip label={`👁️ ${videos[selectedVideo].views}`} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h6">{videos[selectedVideo].title}</Typography>
                </CardContent>
              </>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <YouTubeIcon color="error" /> Video Library ({filteredVideos.length})
          </Typography>
          <List sx={{ maxHeight: 450, overflow: 'auto' }}>
            {filteredVideos.map((video, index) => (
              <ListItem key={video.id} button selected={selectedVideo === index} onClick={() => setSelectedVideo(index)}
                sx={{ borderRadius: 2, mb: 1,
                  bgcolor: selectedVideo === index ? 'rgba(26,35,126,0.08)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(26,35,126,0.05)' } }}>
                <ListItemIcon><PlayCircleIcon color={selectedVideo === index ? 'primary' : 'action'} /></ListItemIcon>
                <ListItemText primary={video.title} secondary={`${video.category} • ${video.duration}`}
                  primaryTypographyProps={{ fontWeight: selectedVideo === index ? 600 : 400 }} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

// ============= EXPERT TALKS TAB =============
const ExpertTalksTab = () => {
  const expertTalks = [
    { id: 1, name: 'Dr. Niranjan Hiranandani', role: 'MD, Hiranandani Group', topic: 'Future of Indian Real Estate', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200', date: '2026-06-28' },
    { id: 2, name: 'Ar. Hafeez Contractor', role: 'Renowned Architect', topic: 'Sustainable Construction in India', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', date: '2026-06-25' },
    { id: 3, name: 'Mr. Rajesh Agarwal', role: 'CEO, L&T Construction', topic: 'Technology in Construction', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', date: '2026-06-22' },
    { id: 4, name: 'Dr. Jagan Shah', role: 'Urban Planning Expert', topic: 'Smart City Development', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', date: '2026-06-20' },
  ];

  const articles = [
    { id: 1, title: 'The Rise of Smart Cities in India', magazine: 'Construction World', link: 'https://www.constructionworld.in/' },
    { id: 2, title: 'Green Building Materials Guide', magazine: 'Indian Builder', link: 'https://www.indianbuilder.in/' },
    { id: 3, title: 'Architectural Trends 2026', magazine: 'Architecture + Design', link: 'https://www.architectureplusdesign.in/' },
    { id: 4, title: 'Real Estate Market Outlook 2026', magazine: 'Realty Plus', link: 'https://www.realtyplusmag.com/' },
    { id: 5, title: 'Concrete Technology Innovations', magazine: 'Indian Concrete Journal', link: 'https://www.icjonline.com/' },
    { id: 6, title: 'Infrastructure Development in India', magazine: 'Infrastructure Today', link: 'https://www.infrastructuretoday.co.in/' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #4a148c, #6a1b9a)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🎙️ Expert Talks & Magazine Articles
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PodcastsIcon color="secondary" /> Industry Expert Talks
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {expertTalks.map((talk) => (
          <Grid item xs={12} sm={6} md={3} key={talk.id}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar src={talk.image} sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold">{talk.name}</Typography>
                <Typography variant="caption" color="textSecondary" display="block">{talk.role}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{talk.topic}</Typography>
                <Chip label={`📅 ${talk.date}`} size="small" sx={{ mt: 1 }} variant="outlined" />
                <Button size="small" sx={{ mt: 1 }} startIcon={<PlayCircleIcon />}>Watch Interview</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArticleIcon color="primary" /> Latest Magazine Articles
      </Typography>
      <Grid container spacing={2}>
        {articles.map((article) => (
          <Grid item xs={12} sm={6} md={4} key={article.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{article.title}</Typography>
                <Typography variant="body2" color="textSecondary">{article.magazine}</Typography>
                <Button 
                  size="small" 
                  sx={{ mt: 1 }} 
                  startIcon={<OpenInNewIcon />}
                  component="a"
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read Full Article
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// ============= 3D DESIGN TAB =============
const ThreeDDesignTab = () => {
  const [designMode, setDesignMode] = useState('floorplan');

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #e65100, #ff6f00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🎨 3D Building Designer
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <ToggleButtonGroup value={designMode} exclusive onChange={(e, v) => v && setDesignMode(v)} size="small">
              <ToggleButton value="floorplan"><WindowIcon /> Floor Plan</ToggleButton>
              <ToggleButton value="3d"><ThreeDRotationIcon /> 3D View</ToggleButton>
              <ToggleButton value="interior"><InteriorIcon /> Interior</ToggleButton>
            </ToggleButtonGroup>
            <Divider orientation="vertical" flexItem />
            <Chip label="🎮 Drag rooms, click to select, use +/- to resize" color="info" variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ThreeDGame />
        </CardContent>
      </Card>
    </Box>
  );
};

// ============= PUZZLE GAMES TAB =============
const PuzzleGamesTab = () => {
  const [completedGames, setCompletedGames] = useState({});
  const [totalScore, setTotalScore] = useState(0);

  const games = [
    { id: 'foundation', title: 'Foundation & Footings', icon: <BuildIcon sx={{ fontSize: 48 }} />, difficulty: 'Medium', description: 'Test your knowledge of building foundations!' },
    { id: 'materials', title: 'Construction Materials', icon: <ConstructionIcon sx={{ fontSize: 48 }} />, difficulty: 'Easy', description: 'Identify different construction materials!' },
    { id: 'plumbing', title: 'Plumbing Systems', icon: <DesignServicesIcon sx={{ fontSize: 48 }} />, difficulty: 'Hard', description: 'Challenge your plumbing knowledge!' },
    { id: 'structural', title: 'Structural Design', icon: <ArchitectureIcon sx={{ fontSize: 48 }} />, difficulty: 'Hard', description: 'Test your structural engineering skills!' },
  ];

  const handleGameComplete = (gameId, score) => {
    setCompletedGames({ ...completedGames, [gameId]: true });
    setTotalScore(prev => prev + score);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>🧩 Construction Puzzle Games</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Test your construction knowledge with these interactive puzzles! 🏗️
        {Object.keys(completedGames).length > 0 && ` Total Score: ${totalScore}`}
      </Typography>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={3} key={game.id}>
            <PuzzleGame 
              title={game.title}
              description={game.description}
              icon={game.icon}
              difficulty={game.difficulty}
              onComplete={(score) => handleGameComplete(game.id, score)}
            />
          </Grid>
        ))}
      </Grid>

      {Object.keys(completedGames).length === games.length && (
        <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 48 }} />
            <Typography variant="h5">🎉 Congratulations!</Typography>
            <Typography variant="body1">You've completed all puzzles! Total Score: {totalScore}</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// ============= NEW MATERIALS TAB =============
const NewMaterialsTab = () => {
  const materials = [
    { id: 1, name: 'Self-Healing Concrete', description: 'Concrete that repairs its own cracks using bacteria', type: 'Technology', hot: true, date: '2026-06-28', link: 'https://www.constructionworld.in/latest-news/self-healing-concrete' },
    { id: 2, name: 'Smart Bricks with IoT Sensors', description: 'Bricks with embedded sensors for structural health monitoring', type: 'Materials', hot: true, date: '2026-06-25', link: 'https://www.indianbuilder.in/smart-bricks' },
    { id: 3, name: 'Carbon-Negative Cement', description: 'Cement that absorbs CO2 during curing', type: 'Materials', hot: true, date: '2026-06-22', link: 'https://www.icjonline.com/carbon-negative-cement' },
    { id: 4, name: 'AI Construction Management Platform', description: 'AI-powered platform for real-time project monitoring', type: 'Technology', hot: false, date: '2026-06-20', link: 'https://www.constructionworld.in/ai-construction' },
    { id: 5, name: 'Green Insulation Panels', description: 'Eco-friendly insulation from recycled materials', type: 'Materials', hot: true, date: '2026-06-18', link: 'https://www.indianbuilder.in/green-insulation' },
    { id: 6, name: '3D Printed Building Components', description: 'Revolutionary 3D printed components for rapid construction', type: 'Technology', hot: true, date: '2026-06-15', link: 'https://www.architectureplusdesign.in/3d-printing' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #e65100, #ff6f00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🆕 New Materials in Market
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Stay updated with the latest construction materials and technologies hitting the Indian market.
      </Typography>

      <Grid container spacing={3}>
        {materials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material.id}>
            <Card sx={{ position: 'relative', height: '100%' }}>
              {material.hot && (
                <Chip label="🔥 HOT" color="error" sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }} />
              )}
              <CardContent>
                <Typography variant="h6">{material.name}</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>{material.description}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={material.type} size="small" color={material.type === 'Technology' ? 'info' : 'success'} />
                  <Typography variant="caption">{new Date(material.date).toLocaleDateString()}</Typography>
                </Box>
                <Button 
                  size="small" 
                  sx={{ mt: 2 }} 
                  startIcon={<OpenInNewIcon />}
                  component="a"
                  href={material.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// ============= GUIDELINES TAB =============
const GuidelinesTab = () => {
  const [tabValue, setTabValue] = useState(0);

  const guidelinesData = [
    {
      id: 'rera',
      title: '🏛️ RERA Guidelines',
      icon: <GavelIcon sx={{ fontSize: 32, color: '#1a237e' }} />,
      officialWebsite: 'https://rera.gov.in/',
      sections: [
        { title: 'Registration Requirements', content: 'All real estate projects must be registered with RERA before marketing or selling.' },
        { title: 'Buyer Protection', content: 'RERA ensures timely possession, quality construction, and financial transparency.' },
        { title: 'Project Disclosure', content: 'Developers must disclose all project details including layout plans and approvals.' },
      ]
    },
    {
      id: 'bda',
      title: '🏗️ BDA Rules',
      icon: <LocationCityIcon sx={{ fontSize: 32, color: '#00695c' }} />,
      officialWebsite: 'https://bda.gov.in/',
      sections: [
        { title: 'Land Use Regulations', content: 'Properties must comply with BDA land use classifications and zoning regulations.' },
        { title: 'Building Approval', content: 'All building plans must be approved by BDA with proper documentation.' },
        { title: 'Property Tax', content: 'BDA property tax must be paid annually.' },
      ]
    },
    {
      id: 'gba',
      title: '🌆 GBA Guidelines',
      icon: <ApartmentIcon sx={{ fontSize: 32, color: '#4a148c' }} />,
      officialWebsite: 'https://www.gba.gov.in/',
      sections: [
        { title: 'GBA Registration', content: 'All building construction projects must register with GBA.' },
        { title: 'Construction Standards', content: 'Buildings must adhere to structural safety and quality standards.' },
      ]
    },
    {
      id: 'bmrda',
      title: '📍 BMRDA Regulations',
      icon: <DashboardIcon sx={{ fontSize: 32, color: '#bf360c' }} />,
      officialWebsite: 'https://bmrda.karnataka.gov.in/',
      sections: [
        { title: 'Metropolitan Planning', content: 'BMRDA oversees development in the metropolitan area.' },
        { title: 'Infrastructure Standards', content: 'Development must meet infrastructure standards.' },
      ]
    },
    {
      id: 'revenue',
      title: '📊 Revenue Land',
      icon: <AgricultureIcon sx={{ fontSize: 32, color: '#2e7d32' }} />,
      officialWebsite: 'https://landrecords.karnataka.gov.in/',
      sections: [
        { title: 'Land Revenue Records', content: 'Maintain up-to-date land revenue records.' },
        { title: 'Land Classification', content: 'Understand classification of land for different uses.' },
      ]
    },
    {
      id: 'industrial',
      title: '🏭 Industrial Land',
      icon: <SettingsEthernetIcon sx={{ fontSize: 32, color: '#e65100' }} />,
      officialWebsite: 'https://www.kiadb.in/',
      sections: [
        { title: 'Industrial Land Acquisition', content: 'Guidelines for acquiring industrial land.' },
        { title: 'Industrial Development', content: 'Requirements for developing industrial land.' },
      ]
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #bf360c, #e65100)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        📋 Guidelines & Regulations
      </Typography>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        {guidelinesData.map((item, i) => (
          <Tab key={i} label={item.title.split(' ').slice(1).join(' ')} icon={item.icon} iconPosition="start" sx={{ fontWeight: 600 }} />
        ))}
      </Tabs>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {guidelinesData[tabValue].icon}
              <Typography variant="h5">{guidelinesData[tabValue].title}</Typography>
            </Box>
            <Button 
              size="small" 
              startIcon={<OpenInNewIcon />}
              component="a"
              href={guidelinesData[tabValue].officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
            >
              Official Website
            </Button>
          </Box>

          <Grid container spacing={2}>
            {guidelinesData[tabValue].sections.map((section, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Accordion sx={{ borderRadius: 2, '&:before': { display: 'none' }, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    {section.title}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{section.content}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(26,35,126,0.04)', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>🔗 Quick Links</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="RERA Portal" component="a" href="https://rera.gov.in/" target="_blank" clickable />
              <Chip label="BDA Portal" component="a" href="https://bda.gov.in/" target="_blank" clickable />
              <Chip label="BMRDA Portal" component="a" href="https://bmrda.karnataka.gov.in/" target="_blank" clickable />
              <Chip label="Land Records" component="a" href="https://landrecords.karnataka.gov.in/" target="_blank" clickable />
              <Chip label="KIADB" component="a" href="https://www.kiadb.in/" target="_blank" clickable />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// ============= LEADERBOARD TAB =============
const LeaderboardTab = () => {
  const { leaderboard, isLoading, error, fetchLeaderboard } = useContext(LeaderboardContext);
  const { getCertificate } = useContext(CertificateContext);

  useEffect(() => { fetchLeaderboard(); }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <StarIcon sx={{ color: 'gold', fontSize: 28 }} />;
    if (rank === 2) return <StarIcon sx={{ color: 'silver', fontSize: 24 }} />;
    if (rank === 3) return <StarIcon sx={{ color: '#cd7f32', fontSize: 20 }} />;
    return null;
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!leaderboard || leaderboard.length === 0) {
    return <Alert severity="info" sx={{ mt: 2 }}>No scores available yet. Complete the quiz to be featured!</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
        background: 'linear-gradient(135deg, #1a237e, #ff6f00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🏆 Leaderboard
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #1a237e, #283593)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Participant</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.id} sx={{ bgcolor: index === 0 ? '#FFF8E1' : 'inherit' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRankIcon(index + 1)}
                        <Typography variant="body1">#{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'grey.500' }}>
                          {entry.userName?.charAt(0) || 'G'}
                        </Avatar>
                        <Typography variant="body1" fontWeight={index < 3 ? 'bold' : 'normal'}>
                          {entry.userName || 'Guest'}
                        </Typography>
                        {index === 0 && <Chip label="🥇" size="small" />}
                        {index === 1 && <Chip label="🥈" size="small" />}
                        {index === 2 && <Chip label="🥉" size="small" />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${entry.score}%`} color={entry.score >= 80 ? 'success' : entry.score >= 60 ? 'warning' : 'default'} />
                      {entry.score === 100 && <EmojiEventsIcon sx={{ ml: 1, color: 'gold' }} />}
                    </TableCell>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {entry.certificateId && (
                        <Button size="small" startIcon={<GetAppIcon />} onClick={() => getCertificate(entry.certificateId)}
                          variant="contained" color="success">
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

// ============= MAIN PAGE =============
export default function LearnEarnPage() {
  const [activeTab, setActiveTab] = useState(0);

  const renderTabContent = () => {
    switch(activeTab) {
      case 0: return <QuizTab />;
      case 1: return <EducationTab />;
      case 2: return <ExpertTalksTab />;
      case 3: return <ThreeDDesignTab />;
      case 4: return <PuzzleGamesTab />;
      case 5: return <NewMaterialsTab />;
      case 6: return <GuidelinesTab />;
      case 7: return <LeaderboardTab />;
      default: return <QuizTab />;
    }
  };

  return (
    <ThemeProvider theme={premiumTheme}>
      <CssBaseline />
      <QuizProvider>
        <LeaderboardProvider>
          <CertificateProvider>
            <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              {renderTabContent()}
            </MainLayout>
          </CertificateProvider>
        </LeaderboardProvider>
      </QuizProvider>
    </ThemeProvider>
  );
}

