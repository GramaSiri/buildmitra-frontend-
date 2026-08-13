import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography,
  Tabs, Tab, Box, Container, IconButton, Card, CardContent,
  LinearProgress, RadioGroup, Radio, Button, Grid, Chip, Divider,
  List, ListItem, ListItemText, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Accordion,
  AccordionSummary, AccordionDetails, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CardMedia, Select, MenuItem, FormControl, InputLabel, FormControlLabel, InputAdornment, CircularProgress
} from '@mui/material';
import {
  Quiz as QuizIcon, Games as GamesIcon,
  Gavel as GavelIcon, EmojiEvents as EmojiEventsIcon,
  YouTube as YouTubeIcon, NewReleases as NewReleasesIcon,
  ExpandMore as ExpandMoreIcon, Apartment as ApartmentIcon,
  Close as CloseIcon, ArrowBack as ArrowBackIcon, Verified as VerifiedIcon,
  Podcasts as PodcastsIcon, Calculate as CalculateIcon,
  WhatsApp as WhatsAppIcon, Print as PrintIcon, Timer as TimerIcon,
  CloudUpload as CloudUploadIcon, PictureAsPdf as PdfIcon,
  InsertDriveFile as DocIcon, Image as ImageIcon, VideoLibrary as VideoIcon,
  Star as StarIcon, WorkspacePremium as WorkspacePremiumIcon,
  MilitaryTech as MilitaryTechIcon, Phone as PhoneIcon, Email as EmailIcon,
  PlayArrow as PlayIcon, OpenInNew as OpenInNewIcon,
  NavigateBefore as PrevIcon, NavigateNext as NextIcon,
  Refresh as RefreshIcon, Search as SearchIcon, Bookmark as BookmarkIcon, Share as ShareIcon
} from '@mui/icons-material';
import FormulaGallery from '../components/FormulaGallery';
import { DesignGamesHub } from '../components/learn-earn/games/DesignGamesHub';

import { getApiBase } from "../utils/apiConfig";
import { resolveMediaUrl } from "../utils/mediaResolver";
// ============= 40 MAJOR CONSTRUCTION STAGES =============
const CONSTRUCTION_STAGES = [
  { number: 1, name: "Site inspection and site marking" },
  { number: 2, name: "Soil testing" },
  { number: 3, name: "Survey and layout marking" },
  { number: 4, name: "Excavation" },
  { number: 5, name: "PCC work" },
  { number: 6, name: "Footing reinforcement" },
  { number: 7, name: "Footing concreting" },
  { number: 8, name: "Foundation and pedestal" },
  { number: 9, name: "Plinth beam" },
  { number: 10, name: "Backfilling and compaction" },
  { number: 11, name: "Anti-termite treatment" },
  { number: 12, name: "Ground-floor slab" },
  { number: 13, name: "Column reinforcement and casting" },
  { number: 14, name: "Beam reinforcement" },
  { number: 15, name: "Slab shuttering" },
  { number: 16, name: "Slab reinforcement" },
  { number: 17, name: "Electrical slab conduits" },
  { number: 18, name: "Plumbing sleeve work" },
  { number: 19, name: "Slab concreting" },
  { number: 20, name: "Blockwork and brickwork" },
  { number: 21, name: "Door and window frames" },
  { number: 22, name: "Internal plastering" },
  { number: 23, name: "External plastering" },
  { number: 24, name: "Waterproofing" },
  { number: 25, name: "Plumbing concealed work" },
  { number: 26, name: "Electrical concealed work" },
  { number: 27, name: "Flooring and tile work" },
  { number: 28, name: "False ceiling" },
  { number: 29, name: "Painting and putty" },
  { number: 30, name: "Doors, windows and grills" },
  { number: 31, name: "Sanitary fixture installation" },
  { number: 32, name: "Electrical fixture installation" },
  { number: 33, name: "Kitchen installation" },
  { number: 34, name: "External development and drainage" },
  { number: 35, name: "Compound wall and gate" },
  { number: 36, name: "Elevation finishing" },
  { number: 37, name: "Testing and commissioning" },
  { number: 38, name: "Cleaning" },
  { number: 39, name: "Snag inspection" },
  { number: 40, name: "Snag rectification and final handover" }
];

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
  shape: { borderRadius: 16 }
});

// ============= 520 CLEAN AUTHENTIC CIVIL QUESTIONS =============
const QUESTION_BANK_CLEAN: any[] = [
  {
    "id": 1,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 2,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 3,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 4,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 5,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 6,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 7,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 8,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 9,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 10,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 11,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 12,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 13,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 14,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 15,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 16,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 17,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 18,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 19,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 20,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 21,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 22,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 23,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 24,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 25,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 26,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 27,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 28,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 29,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 30,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 31,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 32,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 33,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 34,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 35,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 36,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 37,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 38,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 39,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 40,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 41,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 42,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 43,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 44,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 45,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 46,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 47,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 48,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 49,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 50,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 51,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 52,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 53,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 54,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 55,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 56,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 57,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 58,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 59,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 60,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 61,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 62,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 63,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 64,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 65,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 66,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 67,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 68,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 69,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 70,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 71,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 72,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 73,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 74,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 75,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 76,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 77,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 78,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 79,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 80,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 81,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 82,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 83,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 84,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 85,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 86,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 87,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 88,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 89,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 90,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 91,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 92,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 93,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 94,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 95,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 96,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 97,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 98,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 99,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 100,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 101,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 102,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 103,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 104,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 105,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 106,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 107,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 108,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 109,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 110,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 111,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 112,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 113,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 114,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 115,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 116,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 117,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 118,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 119,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 120,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 121,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 122,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 123,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 124,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 125,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 126,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 127,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 128,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 129,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 130,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 131,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 132,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 133,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 134,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 135,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 136,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 137,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 138,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 139,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 140,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 141,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 142,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 143,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 144,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 145,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 146,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 147,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 148,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 149,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 150,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 151,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 152,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 153,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 154,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 155,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 156,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 157,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 158,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 159,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 160,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 161,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 162,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 163,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 164,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 165,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 166,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 167,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 168,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 169,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 170,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 171,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 172,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 173,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 174,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 175,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 176,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 177,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 178,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 179,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 180,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 181,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 182,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 183,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 184,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 185,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 186,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 187,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 188,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 189,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 190,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 191,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 192,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 193,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 194,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 195,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 196,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 197,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 198,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 199,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 200,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 201,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 202,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 203,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 204,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 205,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 206,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 207,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 208,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 209,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 210,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 211,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 212,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 213,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 214,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 215,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 216,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 217,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 218,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 219,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 220,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 221,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 222,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 223,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 224,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 225,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 226,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 227,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 228,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 229,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 230,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 231,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 232,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 233,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 234,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 235,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 236,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 237,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 238,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 239,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 240,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 241,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 242,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 243,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 244,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 245,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 246,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 247,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 248,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 249,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 250,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 251,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 252,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 253,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 254,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 255,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 256,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 257,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 258,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 259,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 260,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 261,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 262,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 263,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 264,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 265,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 266,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 267,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 268,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 269,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 270,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 271,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 272,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 273,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 274,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 275,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 276,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 277,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 278,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 279,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 280,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 281,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 282,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 283,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 284,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 285,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 286,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 287,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 288,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 289,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 290,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 291,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 292,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 293,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 294,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 295,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 296,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 297,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 298,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 299,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 300,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 301,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 302,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 303,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 304,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 305,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 306,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 307,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 308,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 309,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 310,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 311,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 312,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 313,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 314,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 315,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 316,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 317,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 318,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 319,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 320,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 321,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 322,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 323,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 324,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 325,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 326,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 327,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 328,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 329,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 330,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 331,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 332,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 333,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 334,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 335,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 336,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 337,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 338,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 339,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 340,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 341,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 342,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 343,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 344,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 345,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 346,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 347,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 348,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 349,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 350,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 351,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 352,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 353,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 354,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 355,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 356,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 357,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 358,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 359,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 360,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 361,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 362,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 363,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 364,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 365,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 366,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 367,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 368,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 369,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 370,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 371,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 372,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 373,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 374,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 375,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 376,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 377,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 378,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 379,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 380,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 381,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 382,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 383,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 384,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 385,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 386,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 387,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 388,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 389,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 390,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 391,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 392,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 393,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 394,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 395,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 396,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 397,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 398,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 399,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 400,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 401,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 402,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 403,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 404,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 405,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 406,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 407,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 408,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 409,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 410,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 411,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 412,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 413,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 414,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 415,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 416,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 417,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 418,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 419,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 420,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 421,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 422,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 423,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 424,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 425,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 426,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 427,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 428,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 429,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 430,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 431,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 432,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 433,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 434,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 435,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 436,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 437,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 438,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 439,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 440,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 441,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 442,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 443,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 444,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 445,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 446,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 447,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 448,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 449,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 450,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 451,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 452,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 453,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 454,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 455,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 456,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 457,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 458,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 459,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 460,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 461,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 462,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 463,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 464,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 465,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 466,
    "question": "What is the unit weight per meter length of a 25mm TMT steel bar?",
    "options": [
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m",
      "6.310 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 467,
    "question": "What is the standard formula to calculate unit weight of steel rebar in kg/m?",
    "options": [
      "(d^2) / 162.2",
      "(d^2) / 100",
      "(d^2) / 200",
      "(d^3) / 162.2"
    ],
    "correctAnswer": 0
  },
  {
    "id": 468,
    "question": "What is the density of structural steel rebar?",
    "options": [
      "7850 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "8100 kg/m³"
    ],
    "correctAnswer": 0
  },
  {
    "id": 469,
    "question": "What is the minimum lap length specified for tension steel rebar in RCC beams?",
    "options": [
      "24 * dia or Ld",
      "30 * dia",
      "40 * dia or Ld",
      "50 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 470,
    "question": "What is the minimum lap length specified for compression steel rebar in RCC columns?",
    "options": [
      "24 * dia",
      "30 * dia",
      "36 * dia",
      "45 * dia"
    ],
    "correctAnswer": 0
  },
  {
    "id": 471,
    "question": "What is the yield strength of Fe 500D grade TMT steel rebar?",
    "options": [
      "415 N/mm²",
      "500 N/mm²",
      "550 N/mm²",
      "600 N/mm²"
    ],
    "correctAnswer": 1
  },
  {
    "id": 472,
    "question": "What does the letter 'D' stand for in Fe 500D steel grade designation?",
    "options": [
      "Ductile / High Elongation",
      "Double strength",
      "Deformed",
      "Durable"
    ],
    "correctAnswer": 0
  },
  {
    "id": 473,
    "question": "What is the standard water supply pressure maintained in residential high-rise distribution loops?",
    "options": [
      "1.0 - 1.5 bar",
      "2.0 - 3.0 bar",
      "4.5 - 6.0 bar",
      "8.0 - 10.0 bar"
    ],
    "correctAnswer": 1
  },
  {
    "id": 474,
    "question": "What is the recommended slope for horizontal 110mm SWR soil drainage pipes?",
    "options": [
      "1 in 40",
      "1 in 80 to 1 in 100",
      "1 in 200",
      "Level horizontal"
    ],
    "correctAnswer": 1
  },
  {
    "id": 475,
    "question": "What is the minimum water seal depth required in sanitary traps (Floor Trap / Nahani Trap)?",
    "options": [
      "25 mm",
      "50 mm",
      "75 mm",
      "100 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 476,
    "question": "Which pipe material is recommended for hot and cold pressure water supply inside residential toilets?",
    "options": [
      "CPVC (Chlorinated PVC)",
      "Plain PVC",
      "Cast Iron",
      "Unreinforced Concrete"
    ],
    "correctAnswer": 0
  },
  {
    "id": 477,
    "question": "What is the primary function of a cowl vent pipe fitted at terrace stack top?",
    "options": [
      "To release sewer gases and balance air pressure",
      "To collect rainwater",
      "To store hot water",
      "To increase water pressure"
    ],
    "correctAnswer": 0
  },
  {
    "id": 478,
    "question": "What is the minimum recommended size of soil waste pipe connected to a European Water Closet (EWC)?",
    "options": [
      "50 mm",
      "75 mm",
      "110 mm",
      "160 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 479,
    "question": "What is the minimum recommended capacity of overhead domestic water tank per person per day?",
    "options": [
      "50 Liters",
      "135 Liters",
      "250 Liters",
      "500 Liters"
    ],
    "correctAnswer": 1
  },
  {
    "id": 480,
    "question": "What is the minimum copper wire size recommended for 15A heavy power sockets (Geyser/AC/Kitchen)?",
    "options": [
      "1.5 sqmm",
      "2.5 sqmm",
      "4.0 sqmm",
      "6.0 sqmm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 481,
    "question": "What is the maximum number of light/fan points allowed per 6A lighting sub-circuit as per IS 732?",
    "options": [
      "5 points",
      "10 points or 800W",
      "15 points",
      "20 points"
    ],
    "correctAnswer": 1
  },
  {
    "id": 482,
    "question": "What is the tripping sensitivity of an RCCB specified for human shock protection?",
    "options": [
      "10 mA",
      "30 mA",
      "100 mA",
      "300 mA"
    ],
    "correctAnswer": 1
  },
  {
    "id": 483,
    "question": "What color is standardly designated for Ground/Earth wiring in Indian electrical installations?",
    "options": [
      "Red",
      "Black",
      "Green or Green/Yellow",
      "Blue"
    ],
    "correctAnswer": 2
  },
  {
    "id": 484,
    "question": "What is the standard mounting height from Finished Floor Level (FFL) for main light switchboards?",
    "options": [
      "600 mm",
      "900 mm",
      "1200 mm to 1300 mm",
      "1800 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 485,
    "question": "Which circuit breaker curve type is recommended for inductive motor loads?",
    "options": [
      "B-Curve MCB",
      "C-Curve MCB",
      "D-Curve MCB",
      "Z-Curve MCB"
    ],
    "correctAnswer": 1
  },
  {
    "id": 486,
    "question": "In IS 1200 plastering measurement, what deduction is made for wall openings smaller than 0.5 sq.m?",
    "options": [
      "No deduction is made",
      "50% deduction made",
      "100% deduction made",
      "Full deduction plus jamb addition"
    ],
    "correctAnswer": 0
  },
  {
    "id": 487,
    "question": "How is shuttering / formwork work area measured in civil BOQ?",
    "options": [
      "Cubic meters (Cum)",
      "Square feet / Square meters of contact area",
      "Running feet (Rft)",
      "Metric Ton"
    ],
    "correctAnswer": 1
  },
  {
    "id": 488,
    "question": "What is the dry volume conversion factor for concrete batching calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.75"
    ],
    "correctAnswer": 2
  },
  {
    "id": 489,
    "question": "What is the dry mortar volume conversion factor for brickwork masonry calculations?",
    "options": [
      "1.15",
      "1.33",
      "1.54",
      "1.80"
    ],
    "correctAnswer": 1
  },
  {
    "id": 490,
    "question": "What is the standard modular size of a clay brick including mortar joint?",
    "options": [
      "190 x 90 x 90 mm",
      "200 x 100 x 100 mm",
      "225 x 112.5 x 75 mm",
      "250 x 125 x 75 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 491,
    "question": "Under RERA Act 2016, what is Carpet Area defined as?",
    "options": [
      "Net usable floor area excluding external walls & balcony",
      "Super built-up area including lobby",
      "Plinth area of building",
      "Plot area"
    ],
    "correctAnswer": 0
  },
  {
    "id": 492,
    "question": "What mandatory percentage of buyer project collections must a developer deposit into a RERA Escrow Account?",
    "options": [
      "30%",
      "50%",
      "70%",
      "100%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 493,
    "question": "What is the structural defect liability period under RERA during which developer must rectify defects without charge?",
    "options": [
      "1 Year",
      "3 Years",
      "5 Years",
      "10 Years"
    ],
    "correctAnswer": 2
  },
  {
    "id": 494,
    "question": "What document issued by BBMP/BDA certifies that a building is constructed as per sanctioned plan and fit for habitation?",
    "options": [
      "Encumbrance Certificate (EC)",
      "Occupancy Certificate (OC)",
      "Khata Certificate",
      "Commencement Certificate"
    ],
    "correctAnswer": 1
  },
  {
    "id": 495,
    "question": "What does Encumbrance Certificate (EC Form 15) indicate during property title verification?",
    "options": [
      "Soil test report",
      "All registered transactions, mortgages & encumbrances on property",
      "Building height approval",
      "Architectural plan"
    ],
    "correctAnswer": 1
  },
  {
    "id": 496,
    "question": "What is the minimum grade of concrete recommended for RCC structures exposed to moderate weather conditions as per IS 456:2000?",
    "options": [
      "M15",
      "M20",
      "M25",
      "M30"
    ],
    "correctAnswer": 1
  },
  {
    "id": 497,
    "question": "What is the minimum nominal clear cover required for RCC Footings as per IS 456?",
    "options": [
      "25 mm",
      "40 mm",
      "50 mm",
      "75 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 498,
    "question": "What is the minimum nominal clear cover specified for RCC Columns?",
    "options": [
      "20 mm",
      "40 mm",
      "50 mm",
      "15 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 499,
    "question": "What is the minimum nominal clear cover specified for RCC Slabs?",
    "options": [
      "15 mm",
      "20 mm",
      "25 mm",
      "30 mm"
    ],
    "correctAnswer": 0
  },
  {
    "id": 500,
    "question": "What is the maximum water-cement ratio permitted for M20 RCC under moderate exposure conditions?",
    "options": [
      "0.60",
      "0.55",
      "0.50",
      "0.45"
    ],
    "correctAnswer": 1
  },
  {
    "id": 501,
    "question": "What is the standard curing period for Ordinary Portland Cement (OPC) concrete under normal weather?",
    "options": [
      "3 days",
      "7 days",
      "14 days",
      "28 days"
    ],
    "correctAnswer": 1
  },
  {
    "id": 502,
    "question": "What is the minimum moist curing duration for concrete blended with Pozzolana (PPC) or Slag (PSC)?",
    "options": [
      "7 days",
      "10 days",
      "14 days",
      "21 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 503,
    "question": "What is the standard size of concrete test cube specified in IS 516?",
    "options": [
      "100 mm",
      "150 mm",
      "200 mm",
      "300 mm"
    ],
    "correctAnswer": 1
  },
  {
    "id": 504,
    "question": "At what age is the characteristic compressive strength of concrete officially evaluated?",
    "options": [
      "7 days",
      "14 days",
      "28 days",
      "56 days"
    ],
    "correctAnswer": 2
  },
  {
    "id": 505,
    "question": "What percentage of 28-day compressive strength is concrete expected to achieve at 7 days of moist curing?",
    "options": [
      "35%",
      "50%",
      "65%",
      "90%"
    ],
    "correctAnswer": 2
  },
  {
    "id": 506,
    "question": "Which slump value range is suitable for normal RCC beams, columns, and slabs?",
    "options": [
      "10 - 25 mm",
      "25 - 50 mm",
      "75 - 100 mm",
      "150 - 200 mm"
    ],
    "correctAnswer": 2
  },
  {
    "id": 507,
    "question": "What is the minimum percentage of longitudinal steel reinforcement required in an RCC column as per IS 456?",
    "options": [
      "0.4%",
      "0.8%",
      "1.2%",
      "2.0%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 508,
    "question": "What is the maximum allowable longitudinal reinforcement percentage in an RCC column (not lap-spliced)?",
    "options": [
      "4%",
      "6%",
      "8%",
      "10%"
    ],
    "correctAnswer": 1
  },
  {
    "id": 509,
    "question": "What is the minimum number of main longitudinal bars required in a Circular RCC Column?",
    "options": [
      "4 bars",
      "6 bars",
      "8 bars",
      "12 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 510,
    "question": "What is the minimum number of main longitudinal bars required in a Rectangular RCC Column?",
    "options": [
      "2 bars",
      "4 bars",
      "6 bars",
      "8 bars"
    ],
    "correctAnswer": 1
  },
  {
    "id": 511,
    "question": "What is the maximum pitch/spacing of shear stirrups in RCC beams as per IS 456?",
    "options": [
      "0.75 * d or 300 mm",
      "1.0 * d or 450 mm",
      "0.5 * d or 200 mm",
      "300 mm only"
    ],
    "correctAnswer": 0
  },
  {
    "id": 512,
    "question": "What is the Modular Ratio (m) formula in Working Stress Method as per IS 456?",
    "options": [
      "280 / (3 * sigma_cbc)",
      "280 / (2 * sigma_cbc)",
      "200 / sigma_cbc",
      "Es / Ec"
    ],
    "correctAnswer": 0
  },
  {
    "id": 513,
    "question": "Which short-term static modulus of elasticity formula is used for concrete in N/mm²?",
    "options": [
      "5000 * sqrt(fck)",
      "5700 * sqrt(fck)",
      "4500 * sqrt(fck)",
      "3000 * sqrt(fck)"
    ],
    "correctAnswer": 0
  },
  {
    "id": 514,
    "question": "What is the density of reinforced cement concrete (RCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2700 kg/m³"
    ],
    "correctAnswer": 2
  },
  {
    "id": 515,
    "question": "What is the density of plain cement concrete (PCC)?",
    "options": [
      "2200 kg/m³",
      "2400 kg/m³",
      "2500 kg/m³",
      "2600 kg/m³"
    ],
    "correctAnswer": 1
  },
  {
    "id": 516,
    "question": "What is the unit weight per meter length of an 8mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 0
  },
  {
    "id": 517,
    "question": "What is the unit weight per meter length of a 10mm TMT steel bar?",
    "options": [
      "0.395 kg/m",
      "0.617 kg/m",
      "0.888 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 518,
    "question": "What is the unit weight per meter length of a 12mm TMT steel bar?",
    "options": [
      "0.617 kg/m",
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m"
    ],
    "correctAnswer": 1
  },
  {
    "id": 519,
    "question": "What is the unit weight per meter length of a 16mm TMT steel bar?",
    "options": [
      "0.888 kg/m",
      "1.210 kg/m",
      "1.580 kg/m",
      "2.470 kg/m"
    ],
    "correctAnswer": 2
  },
  {
    "id": 520,
    "question": "What is the unit weight per meter length of a 20mm TMT steel bar?",
    "options": [
      "1.580 kg/m",
      "2.470 kg/m",
      "3.850 kg/m",
      "4.830 kg/m"
    ],
    "correctAnswer": 1
  }
];

export default function LearnAndEarnPage() {
  const router = useRouter();

  // Active Tab Index
  const [tabIndex, setTabIndex] = useState(0);

  // User State
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('9876543210');
  const [userEmail, setUserEmail] = useState('engineer@buildmitra.com');

  // Quiz Engine State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(20).fill(null));
  const [timeLeft, setTimeLeft] = useState(300); // 5 Minutes (300 Seconds)
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [openCertDialog, setOpenCertDialog] = useState(false);

  // Construction Videos 40-Stage State
  const [constructionVideos, setConstructionVideos] = useState<any[]>([]);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<string>('All');
  const [videoSearch, setVideoSearch] = useState<string>('');
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<any>(null);

  // Upload YouTube Video Modal State
  const [openVideoUploadModal, setOpenVideoUploadModal] = useState<boolean>(false);
  const [uploadStageNum, setUploadStageNum] = useState<number>(1);
  const [uploadVideoTitle, setUploadVideoTitle] = useState<string>('');
  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState<string>('');
  const [uploadLanguage, setUploadLanguage] = useState<string>('Kannada');
  const [uploadChannelName, setUploadChannelName] = useState<string>('Civil Tech Kannada');
  const [uploadDuration, setUploadDuration] = useState<string>('12:00');
  const [uploadDescription, setUploadDescription] = useState<string>('');

  // Expert Talks & Industry Intelligence State
  const [expertTalks, setExpertTalks] = useState<any[]>([]);
  const [expertStats, setExpertStats] = useState<any>({
    articlesTodayCount: 0,
    activePublicationsCount: 4,
    totalFeatured: 0,
    lastSuccessfulSyncAt: new Date().toISOString()
  });
  const [expertPublication, setExpertPublication] = useState<string>('All');
  const [expertCategory, setExpertCategory] = useState<string>('All');
  const [expertSearch, setExpertSearch] = useState<string>('');
  const [expertSort, setExpertSort] = useState<string>('default');
  const [loadingTalks, setLoadingTalks] = useState<boolean>(false);
  const [syncingTalks, setSyncingTalks] = useState<boolean>(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  const fetchExpertTalks = async () => {
    setLoadingTalks(true);
    try {
      const apiHost = getApiBase();
      let url = `${apiHost}/api/expert-talks?publication=${encodeURIComponent(expertPublication)}&category=${encodeURIComponent(expertCategory)}&search=${encodeURIComponent(expertSearch)}&sort=${expertSort}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setExpertTalks(data.articles);
        if (data.stats) {
          setExpertStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching expert talks:', err);
    } finally {
      setLoadingTalks(false);
    }
  };

  const handleManualSyncTalks = async () => {
    setSyncingTalks(true);
    try {
      const apiHost = getApiBase();
      const res = await fetch(`${apiHost}/api/expert-talks/sync`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Sync Completed! Discovered: ${data.result.recordsDiscovered || 0}, Inserted: ${data.result.recordsInserted}, Updated: ${data.result.recordsUpdated}, Duplicates skipped: ${data.result.duplicatesSkipped}`);
        fetchExpertTalks();
      } else {
        alert('Sync failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Sync error: ' + err.message);
    } finally {
      setSyncingTalks(false);
    }
  };

  useEffect(() => {
    fetchExpertTalks();
  }, [expertPublication, expertCategory, expertSort]);

  const fetchConstructionVideos = async () => {
    setLoadingVideos(true);
    try {
      const apiHost = getApiBase();
      const res = await fetch(`${apiHost}/api/construction-videos`);
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setConstructionVideos(data.videos);
      }
    } catch (err) {
      console.error('Error fetching construction videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchConstructionVideos();
  }, []);

  const handleUploadVideoSubmit = async () => {
    if (!uploadVideoTitle.trim() || !uploadYoutubeUrl.trim()) {
      alert('Please enter Video Title and YouTube Link.');
      return;
    }

    try {
      const stageObj = CONSTRUCTION_STAGES.find(s => s.number === Number(uploadStageNum));
      const apiHost = getApiBase();
      const res = await fetch(`${apiHost}/api/construction-videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageNumber: Number(uploadStageNum),
          stageName: stageObj ? stageObj.name : `Stage ${uploadStageNum}`,
          videoTitle: uploadVideoTitle.trim(),
          youtubeUrl: uploadYoutubeUrl.trim(),
          language: uploadLanguage,
          channelName: uploadChannelName.trim() || 'Civil Engineering Guide',
          duration: uploadDuration.trim() || '10:00',
          shortDescription: uploadDescription.trim() || `Practical house construction video guide for Stage ${uploadStageNum}.`
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('🎉 YouTube Video link uploaded & saved permanently in MongoDB!');
        setOpenVideoUploadModal(false);
        setUploadVideoTitle('');
        setUploadYoutubeUrl('');
        setUploadDescription('');
        fetchConstructionVideos();
      } else {
        alert(data.message || 'Failed to upload video.');
      }
    } catch (err: any) {
      alert('Error uploading video: ' + err.message);
    }
  };

  const filteredVideos = useMemo(() => {
    return constructionVideos.filter(v => {
      const matchesStage = videoSearch.trim() ? true : v.stageNumber === selectedStage;
      const matchesLang = selectedLang === 'All' || v.language === selectedLang;
      const q = videoSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (v.videoTitle && v.videoTitle.toLowerCase().includes(q)) ||
        (v.stageName && v.stageName.toLowerCase().includes(q)) ||
        (v.channelName && v.channelName.toLowerCase().includes(q)) ||
        (v.shortDescription && v.shortDescription.toLowerCase().includes(q));

      return matchesStage && matchesLang && matchesSearch;
    });
  }, [constructionVideos, selectedStage, selectedLang, videoSearch]);

  // Education Upload State
  const [eduFilter, setEduFilter] = useState('All');
  const [openEduUpload, setOpenEduUpload] = useState(false);
  const [newEduTitle, setNewEduTitle] = useState('');
  const [newEduType, setNewEduType] = useState('Video');
  const [newEduUrl, setNewEduUrl] = useState('');
  const [newEduDesc, setNewEduDesc] = useState('');

  const [educationItems, setEducationItems] = useState<any[]>([
    { id: 1, title: 'Phase 1: Site Selection, Soil Testing & Land Marking', type: 'Video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=500', desc: 'Step-by-step land boundary marking & plate load soil test procedure.' },
    { id: 2, title: 'Phase 2: Earthwork Pit Excavation & Raft Footing RCC', type: 'Video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500', desc: 'JCB excavation guidelines, PCC lean bed, & footing rebar mesh layout.' },
    { id: 3, title: 'IS 456 Structural Concrete Handbook & Code Specifications', type: 'Document', url: '#', thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500', desc: 'Official IS 456:2000 reference guide for RCC beam & column design.' },
    { id: 4, title: 'RCC Column Rebar Lapping Site Inspection Photos', type: 'Image', url: '#', thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500', desc: 'High-res site photography illustrating 50*dia staggered lapping.' }
  ]);

  // New Materials Upload State
  const [openMatUpload, setOpenMatUpload] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState('AAC Blocks');
  const [newMatPrice, setNewMatPrice] = useState('');
  const [newMatBenefits, setNewMatBenefits] = useState('');
  const [newMatCatalogUrl, setNewMatCatalogUrl] = useState('');

  const [newMaterials, setNewMaterials] = useState<any[]>([
    { id: 1, name: 'Autoclaved Aerated Concrete (AAC) Blocks', category: 'Blocks', benefits: '50% lighter than red bricks, superior thermal insulation & zero plastering cracks.', price: '₹75 / NOS', supplier: 'BuildMitra Verified AAC Suppliers', catalogUrl: '#' },
    { id: 2, name: 'Self-Healing Bio-Concrete (Bacillus Bacteria)', category: 'Concrete', benefits: 'Automatically seals micro-cracks upon water ingress, extending structural lifespan to 100+ years.', price: '₹6,500 / CUM', supplier: 'UltraTech & ACC Bio-Labs', catalogUrl: '#' },
    { id: 3, name: 'Mivan Monolithic Aluminium Formwork', category: 'Formwork', benefits: 'Enables 7-day floor cycle execution with smooth RCC surface finish and zero plaster requirement.', price: '₹850 / SQFT', supplier: 'Mivan Formwork India', catalogUrl: '#' },
    { id: 4, name: 'FRP (Fiber Reinforced Polymer) Rebars', category: 'Rebar', benefits: '100% corrosion proof, 4x lighter than steel rebar, ideal for sea coast & chemical environments.', price: '₹95 / KG', supplier: 'Composite Rebar Tech', catalogUrl: '#' }
  ]);

  // Guidelines Upload State
  const [openGuideUpload, setOpenGuideUpload] = useState(false);
  const [newGuideAuthority, setNewGuideAuthority] = useState('RERA');
  const [newGuideTitle, setNewGuideTitle] = useState('');
  const [newGuideDesc, setNewGuideDesc] = useState('');

  const [guidelines, setGuidelines] = useState<any[]>([
    { id: 1, authority: 'RERA Act 2016', title: 'Mandatory Project Registration & 70% Escrow Account', desc: 'Any real estate project with plot area > 500 sqm or > 8 apartments must be registered under RERA. 70% of buyer funds must be held in a dedicated bank escrow account.' },
    { id: 2, authority: 'BDA / BBMP / GBA', title: 'DC Conversion (Agricultural to Residential/Commercial)', desc: 'Official guidelines for obtaining Deputy Commissioner (DC) land conversion certificate, Khata A extract, and sanctioned layout plan prior to plot sale.' }
  ]);

  // Real Estate Guide Upload State
  const [openRealEstateUpload, setOpenRealEstateUpload] = useState(false);
  const [newReTitle, setNewReTitle] = useState('');
  const [newReDesc, setNewReDesc] = useState('');

  const [realEstateDocs, setRealEstateDocs] = useState<string[]>([
    'Encumbrance Certificate (EC Form 15 for 30 Years Search)',
    'Mother Deed & Complete Flow of Title (30 Years)',
    'BBMP / BDA A-Khata Certificate & Latest Extract',
    'Sanctioned Building & Floor Layout Plan',
    'Occupancy Certificate (OC) issued by BBMP/BDA',
    'Completion Certificate (CC)',
    'Latest Property Tax Paid Receipts & Chalan',
    'NOC from BESCOM, BWSSB, Pollution Control & Fire Dept'
  ]);

  // Formula & Reference Upload State
  const [openFormulaUpload, setOpenFormulaUpload] = useState(false);
  const [newFormulaName, setNewFormulaName] = useState('');
  const [newFormulaExpr, setNewFormulaExpr] = useState('');
  const [newFormulaCategory, setNewFormulaCategory] = useState('Concrete / Steel');

  const [customFormulas, setCustomFormulas] = useState<any[]>([
    { id: 1, name: 'TMT Steel Unit Weight', expr: 'Weight (kg/m) = (d²) / 162.2', cat: 'Steel Rebar' },
    { id: 2, name: 'Dry Concrete Batching Conversion', expr: 'Dry Concrete Volume = Wet Volume × 1.54', cat: 'Concrete Tech' }
  ]);

  // Leaderboard State (With Mobile & Email Columns)
  const [leaderboard, setLeaderboard] = useState<any[]>([
    { id: 1, userName: 'Rajesh Kumar, BE Civil', mobile: '+91 98450 12345', email: 'rajesh.k@gmail.com', score: 100, time: '3m 42s', date: '2026-07-29', certId: 'BM-CERT-9821' },
    { id: 2, userName: 'Priya Sharma, M.Tech Structural', mobile: '+91 97312 67890', email: 'priya.struct@outlook.com', score: 95, time: '4m 10s', date: '2026-07-28', certId: 'BM-CERT-9815' },
    { id: 3, userName: 'Suresh Gowda, Project Manager', mobile: '+91 94481 54321', email: 'suresh.gowda@yahoo.com', score: 90, time: '4m 30s', date: '2026-07-28', certId: 'BM-CERT-9804' },
    { id: 4, userName: 'Ananya Reddy, Architect', mobile: '+91 99002 11223', email: 'ananya.arch@rediffmail.com', score: 90, time: '4m 45s', date: '2026-07-27', certId: 'BM-CERT-9799' },
    { id: 5, userName: 'Vikram Singh, Site Engineer', mobile: '+91 96113 44556', email: 'vikram.site@gmail.com', score: 85, time: '4m 55s', date: '2026-07-27', certId: 'BM-CERT-9788' }
  ]);

  // Start 20-Question Quiz with ABSOLUTE ZERO Question Repetition (Strict Deduplication)
  const startQuiz = () => {
    if (!userName.trim()) {
      alert('Please enter your Full Name to appear on the Digital Certificate!');
      return;
    }

    let usedTexts: string[] = [];
    try {
      usedTexts = JSON.parse(localStorage.getItem('bm_used_quiz_texts') || '[]');
    } catch (e) { usedTexts = []; }

    let pool = QUESTION_BANK_CLEAN.filter((q: any) => !usedTexts.includes(q.question));
    if (pool.length < 20) {
      usedTexts = [];
      pool = QUESTION_BANK_CLEAN;
    }

    const uniqueMap = new Map();
    pool.forEach((q: any) => {
      if (!uniqueMap.has(q.question)) {
        uniqueMap.set(q.question, q);
      }
    });
    const uniquePool = Array.from(uniqueMap.values());

    const shuffled = [...uniquePool].sort(() => Math.random() - 0.5);
    const selected20 = shuffled.slice(0, 20);

    const newUsedTexts = [...usedTexts, ...selected20.map((q: any) => q.question)];
    try {
      localStorage.setItem('bm_used_quiz_texts', JSON.stringify(newUsedTexts));
    } catch (e) {}

    setQuestions(selected20);
    setAnswers(Array(20).fill(null));
    setCurrentQuestionIndex(0);
    setTimeLeft(300); // 5 Minutes
    setIsQuizActive(true);
    setQuizCompleted(false);
    setScore(0);
    setCertificateData(null);
  };

  // 5-Minute Live Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (isQuizActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQuizActive, timeLeft]);

  // Handle Answer Selection
  const handleSelectAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleAutoSubmit = () => {
    setIsQuizActive(false);
    calculateResults();
  };

  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / 20) * 100);
    const timeSpent = 300 - timeLeft;
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    const timeFormatted = `${minutes}m ${seconds}s`;

    setScore(calculatedScore);
    setQuizCompleted(true);

    const certId = `BM-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert = {
      certId,
      userName: userName.trim() || 'Civil Engineer',
      userPhone: userPhone || '9876543210',
      userEmail: userEmail || 'engineer@buildmitra.com',
      score: calculatedScore,
      correctCount,
      totalCount: 20,
      issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      timeSpent: timeFormatted
    };

    setCertificateData(newCert);

    // Update Leaderboard with Mobile & Email
    setLeaderboard(prev => [
      {
        id: Date.now(),
        userName: newCert.userName,
        mobile: newCert.userPhone,
        email: newCert.userEmail,
        score: calculatedScore,
        time: timeFormatted,
        date: new Date().toISOString().split('T')[0],
        certId
      },
      ...prev
    ].sort((a, b) => b.score - a.score));

    setOpenCertDialog(true);
  };

  // WhatsApp Share Certificate Function
  const handleShareCertificateWhatsApp = () => {
    if (!certificateData) return;
    const message = `🏆 *BUILDMITRA A4 DIGITAL CERTIFICATE OF EXCELLENCE*%0A` +
      `----------------------------------------%0A` +
      `• *Candidate Name*: ${certificateData.userName}%0A` +
      `• *Mobile*: ${certificateData.userPhone}%0A` +
      `• *Email*: ${certificateData.userEmail}%0A` +
      `• *Certificate ID*: ${certificateData.certId}%0A` +
      `• *Quiz Score*: ${certificateData.score}% (${certificateData.correctCount}/20 Correct)%0A` +
      `• *Time Spent*: ${certificateData.timeSpent}%0A` +
      `• *Issue Date*: ${certificateData.issueDate}%0A%0A` +
      `*Verified Digital Civil Engineering & Construction Master Credential via BuildMitra SuperApp*`;
    window.open(`https://wa.me/${certificateData.userPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Upload Handlers
  const handleAddEducationItem = () => {
    if (!newEduTitle) return alert('Enter title');
    setEducationItems([
      { id: Date.now(), title: newEduTitle, type: newEduType, url: newEduUrl || '#', thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=500', desc: newEduDesc || 'Uploaded learning resource.' },
      ...educationItems
    ]);
    setOpenEduUpload(false);
    setNewEduTitle(''); setNewEduUrl(''); setNewEduDesc('');
  };

  const handleAddMaterialItem = () => {
    if (!newMatName) return alert('Enter material name');
    setNewMaterials([
      { id: Date.now(), name: newMatName, category: newMatCategory, price: newMatPrice || 'Price on Request', benefits: newMatBenefits || 'High performance construction material.', supplier: 'Verified Manufacturer', catalogUrl: newMatCatalogUrl || '#' },
      ...newMaterials
    ]);
    setOpenMatUpload(false);
    setNewMatName(''); setNewMatPrice(''); setNewMatBenefits(''); setNewMatCatalogUrl('');
  };

  const handleAddGuideline = () => {
    if (!newGuideTitle) return alert('Enter guideline title');
    setGuidelines([
      { id: Date.now(), authority: newGuideAuthority, title: newGuideTitle, desc: newGuideDesc || 'Official statutory guideline.' },
      ...guidelines
    ]);
    setOpenGuideUpload(false);
    setNewGuideTitle(''); setNewGuideDesc('');
  };

  const handleAddRealEstateDoc = () => {
    if (!newReTitle) return alert('Enter document title');
    setRealEstateDocs([newReTitle, ...realEstateDocs]);
    setOpenRealEstateUpload(false);
    setNewReTitle('');
  };

  const handleAddFormula = () => {
    if (!newFormulaName) return alert('Enter formula name');
    setCustomFormulas([
      { id: Date.now(), name: newFormulaName, expr: newFormulaExpr || 'N/A', cat: newFormulaCategory },
      ...customFormulas
    ]);
    setOpenFormulaUpload(false);
    setNewFormulaName(''); setNewFormulaExpr('');
  };

  const filteredEduItems = useMemo(() => {
    if (eduFilter === 'All') return educationItems;
    return educationItems.filter(i => i.type === eduFilter);
  }, [educationItems, eduFilter]);

  return (
    <ThemeProvider theme={premiumTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>

        {/* 1. Header Bar */}
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton edge="start" color="inherit" onClick={() => router.push('/calculators')}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight="bold">
                🎓 Learn & Earn Hub — BuildMitra Pro
              </Typography>
            </Box>
            <Chip icon={<VerifiedIcon />} label="Certified Engineering Platform" color="secondary" size="small" />
          </Toolbar>
        </AppBar>

        {/* 2. Navigation Tabs */}
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Tabs
              value={tabIndex}
              onChange={(e, val) => setTabIndex(val)}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="secondary"
              textColor="primary"
            >
              <Tab icon={<QuizIcon />} label="Learn & Earn Quiz" />
              <Tab icon={<YouTubeIcon />} label="Education & Videos" />
              <Tab icon={<PodcastsIcon />} label="Expert Talks & Tycoons" />
              <Tab icon={<GamesIcon />} label="Designs & Games" />
              <Tab icon={<NewReleasesIcon />} label="New Materials & Tech" />
              <Tab icon={<GavelIcon />} label="Guidelines & Approvals" />
              <Tab icon={<ApartmentIcon />} label="Real Estate Guide" />
              <Tab icon={<CalculateIcon />} label="Formulas & Reference" />
              <Tab icon={<EmojiEventsIcon />} label="Leaderboard & Certs" />
            </Tabs>
          </Paper>

          {/* TAB 0: LEARN & EARN QUIZ */}
          {tabIndex === 0 && (
            <Box>
              {!isQuizActive && !quizCompleted && (
                <Card sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #1a237e, #283593)', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    🏆 Civil & Construction Master Quiz
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 800, mx: 'auto', mb: 3 }}>
                    Answer 20 unique questions in 5 minutes (300 seconds). Score 80%+ to generate an official BuildMitra A4 Digital Certificate sent straight to your WhatsApp!
                  </Typography>

                  <Grid container spacing={2} justifyContent="center" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        required
                        size="small"
                        label="Your Full Name"
                        placeholder="e.g. Er. Suresh Gowda"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="WhatsApp Mobile Number"
                        value={userPhone}
                        onChange={e => setUserPhone(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email Address"
                        value={userEmail}
                        onChange={e => setUserEmail(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 2 }}
                      />
                    </Grid>
                  </Grid>

                  <Button variant="contained" color="secondary" size="large" onClick={startQuiz} startIcon={<QuizIcon />}>
                    🚀 Start 5-Minute Quiz (20 Unique Questions)
                  </Button>
                </Card>
              )}

              {/* Quiz Active View */}
              {isQuizActive && questions.length > 0 && (
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip label={`Question ${currentQuestionIndex + 1} of 20`} color="primary" />
                    <Chip
                      icon={<TimerIcon />}
                      label={`⏱️ ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                      color={timeLeft < 60 ? "error" : "warning"}
                      sx={{ fontWeight: 'bold', fontSize: '16px' }}
                    />
                  </Box>

                  <LinearProgress variant="determinate" value={((currentQuestionIndex + 1) / 20) * 100} sx={{ mb: 3, height: 8, borderRadius: 4 }} />

                  {/* Clean Direct Question Text */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    {questions[currentQuestionIndex].question}
                  </Typography>

                  <RadioGroup value={answers[currentQuestionIndex] !== null ? answers[currentQuestionIndex] : ''}>
                    {questions[currentQuestionIndex].options.map((opt: string, optIdx: number) => (
                      <Paper
                        key={optIdx}
                        elevation={answers[currentQuestionIndex] === optIdx ? 3 : 1}
                        onClick={() => handleSelectAnswer(optIdx)}
                        sx={{
                          p: 2, mb: 1.5, borderRadius: 2, cursor: 'pointer',
                          bgcolor: answers[currentQuestionIndex] === optIdx ? '#e8eaf6' : 'white',
                          border: answers[currentQuestionIndex] === optIdx ? '2px solid #1a237e' : '1px solid #e0e0e0'
                        }}
                      >
                        <FormControlLabel
                          value={optIdx}
                          control={<Radio checked={answers[currentQuestionIndex] === optIdx} />}
                          label={<Typography variant="body1" fontWeight={answers[currentQuestionIndex] === optIdx ? 'bold' : 'normal'}>{opt}</Typography>}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>Previous</Button>
                    {currentQuestionIndex < 19 ? (
                      <Button variant="contained" color="primary" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Next Question</Button>
                    ) : (
                      <Button variant="contained" color="success" onClick={handleAutoSubmit}>Submit Quiz & Generate Certificate</Button>
                    )}
                  </Box>
                </Card>
              )}
            </Box>
          )}

          {/* TAB 1: RESIDENTIAL CONSTRUCTION VIDEOS MODULE (40 STAGES) */}
          {tabIndex === 1 && (
            <Box>
              {/* Header & Stage Stepper Navigation */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h5" fontWeight="bold">
                    🏗️ Residential Construction Master Learning Module (40 Stages)
                  </Typography>

                  {/* Language Filters & Upload Button */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mr: 1, fontWeight: 'bold' }}>Language:</Typography>
                    {['All', 'Kannada', 'Hindi', 'English'].map(lang => (
                      <Chip
                        key={lang}
                        label={lang === 'Kannada' ? '🟡🔴 Kannada' : lang === 'Hindi' ? '🇮🇳 Hindi' : lang === 'English' ? '🌐 English' : 'All Languages'}
                        onClick={() => setSelectedLang(lang)}
                        color={selectedLang === lang ? 'secondary' : 'default'}
                        variant={selectedLang === lang ? 'filled' : 'outlined'}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 'bold' }}
                      />
                    ))}
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => {
                        setUploadStageNum(selectedStage);
                        setOpenVideoUploadModal(true);
                      }}
                      sx={{ fontWeight: 'bold', ml: 1 }}
                    >
                      Upload YouTube Video
                    </Button>
                  </Box>
                </Box>

                {/* Stage Navigation & Stepper */}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        color="inherit"
                        disabled={selectedStage <= 1}
                        onClick={() => setSelectedStage(prev => Math.max(1, prev - 1))}
                        sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                      >
                        <PrevIcon />
                      </IconButton>

                      <FormControl fullWidth size="small" sx={{ bgcolor: 'white', borderRadius: 2 }}>
                        <Select
                          value={selectedStage}
                          onChange={(e) => setSelectedStage(Number(e.target.value))}
                          sx={{ fontWeight: 'bold', color: '#1a237e' }}
                        >
                          {CONSTRUCTION_STAGES.map(s => (
                            <MenuItem key={s.number} value={s.number}>
                              Stage {s.number}: {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <IconButton
                        color="inherit"
                        disabled={selectedStage >= 40}
                        onClick={() => setSelectedStage(prev => Math.min(40, prev + 1))}
                        sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                      >
                        <NextIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search videos, topics, tools..."
                      value={videoSearch}
                      onChange={(e) => setVideoSearch(e.target.value)}
                      sx={{ bgcolor: 'white', borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(selectedStage / 40) * 100}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#ff6f00' } }}
                  />
                  <Typography variant="caption" fontWeight="bold" sx={{ color: 'white', whiteSpace: 'nowrap' }}>
                    Stage {selectedStage} / 40 Progress
                  </Typography>
                </Box>
              </Paper>

              {/* Current Active Stage Title Banner */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {CONSTRUCTION_STAGES.find(s => s.number === selectedStage)?.name || `Stage ${selectedStage}`}
                </Typography>
                <Chip label={`${filteredVideos.length} Videos Available`} color="primary" variant="outlined" size="small" />
              </Box>

              {/* Videos Grid */}
              {loadingVideos ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary">Loading YouTube Construction Videos from MongoDB...</Typography>
                </Box>
              ) : filteredVideos.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8f9fa' }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No videos found for Stage {selectedStage} with current filters.
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={() => { setSelectedLang('All'); setVideoSearch(''); }}>
                    Reset Filters
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredVideos.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id || item.youtubeId}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        {/* Thumbnail with overlay duration */}
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                            alt={item.videoTitle}
                          />
                          <Chip
                            label={item.duration || 'N/A'}
                            size="small"
                            sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', fontWeight: 'bold' }}
                          />
                          <Chip
                            label={item.language === 'Kannada' ? '🟡🔴 Kannada' : item.language === 'Hindi' ? '🇮🇳 Hindi' : '🌐 English'}
                            size="small"
                            color={item.language === 'Kannada' ? 'secondary' : item.language === 'Hindi' ? 'warning' : 'info'}
                            sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                          />
                        </Box>

                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="caption" color="primary" fontWeight="bold" gutterBottom display="block">
                            Stage {item.stageNumber}: {item.stageName}
                          </Typography>

                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.3, height: '2.6em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.videoTitle}
                          </Typography>

                          <Typography variant="caption" color="textSecondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                            Channel: <strong>{item.channelName}</strong>
                          </Typography>

                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2, height: '3.2em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.shortDescription}
                          </Typography>

                          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<PlayIcon />}
                              onClick={() => setActiveVideoModal(item)}
                            >
                              Watch Video
                            </Button>
                            <IconButton
                              color="secondary"
                              size="small"
                              title="Open in YouTube"
                              onClick={() => window.open(item.youtubeUrl, '_blank')}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Embedded Video Dialog Modal */}
              <Dialog
                open={Boolean(activeVideoModal)}
                onClose={() => setActiveVideoModal(null)}
                maxWidth="md"
                fullWidth
              >
                {activeVideoModal && (
                  <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a237e', color: 'white' }}>
                      <Box>
                        <Chip
                          label={activeVideoModal.language === 'Kannada' ? '🟡🔴 Kannada' : activeVideoModal.language === 'Hindi' ? '🇮🇳 Hindi' : '🌐 English'}
                          size="small"
                          color="secondary"
                          sx={{ mr: 1, fontWeight: 'bold' }}
                        />
                        <Typography variant="subtitle1" fontWeight="bold" component="span">
                          Stage {activeVideoModal.stageNumber}: {activeVideoModal.stageName}
                        </Typography>
                      </Box>
                      <IconButton color="inherit" onClick={() => setActiveVideoModal(null)}>
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
                      <Box sx={{ position: 'relative', pt: '56.25%' }}>
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                          src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1`}
                          title={activeVideoModal.videoTitle}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'flex-start', bgcolor: '#f8f9fa' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {activeVideoModal.videoTitle}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
                        Channel: <strong>{activeVideoModal.channelName}</strong> | Duration: {activeVideoModal.duration}
                      </Typography>
                      <Typography variant="body2">
                        {activeVideoModal.shortDescription}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 1 }}>
                        <Button variant="outlined" color="secondary" onClick={() => window.open(activeVideoModal.youtubeUrl, '_blank')}>
                          Open on YouTube
                        </Button>
                        <Button variant="contained" onClick={() => setActiveVideoModal(null)}>
                          Close
                        </Button>
                      </Box>
                    </DialogActions>
                  </>
                )}
              </Dialog>

              {/* Upload YouTube Video Modal Dialog */}
              <Dialog open={openVideoUploadModal} onClose={() => setOpenVideoUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white', fontWeight: 'bold' }}>
                  📹 Upload New Construction YouTube Video Link
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                    Upload YouTube video links for any of the 40 residential construction stages. Saved permanently in MongoDB.
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>Construction Stage (1-40):</Typography>
                    <Select
                      value={uploadStageNum}
                      onChange={(e) => setUploadStageNum(Number(e.target.value))}
                    >
                      {CONSTRUCTION_STAGES.map(s => (
                        <MenuItem key={s.number} value={s.number}>
                          Stage {s.number}: {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    required
                    label="Video Title"
                    placeholder="e.g. Site Marking & Boundary Measurement in Kannada"
                    value={uploadVideoTitle}
                    onChange={(e) => setUploadVideoTitle(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    required
                    label="YouTube URL / Video Link"
                    placeholder="e.g. https://www.youtube.com/watch?v=G8Ld44N9pQI or https://youtu.be/..."
                    value={uploadYoutubeUrl}
                    onChange={(e) => setUploadYoutubeUrl(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>Video Language:</Typography>
                    <Select
                      value={uploadLanguage}
                      onChange={(e) => setUploadLanguage(e.target.value)}
                    >
                      <MenuItem value="Kannada">🟡🔴 Kannada</MenuItem>
                      <MenuItem value="Hindi">🇮🇳 Hindi</MenuItem>
                      <MenuItem value="English">🌐 English</MenuItem>
                    </Select>
                  </FormControl>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Channel Name"
                        value={uploadChannelName}
                        onChange={(e) => setUploadChannelName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Duration (mm:ss)"
                        value={uploadDuration}
                        onChange={(e) => setUploadDuration(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Short Educational Description"
                    placeholder="Key technical details covered in this site execution video..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                  />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={() => setOpenVideoUploadModal(false)}>Cancel</Button>
                  <Button variant="contained" color="secondary" onClick={handleUploadVideoSubmit} startIcon={<CloudUploadIcon />}>
                    Upload & Save to MongoDB
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}

          {/* TAB 2: EXPERT TALKS & INDUSTRY INTELLIGENCE HUB */}
          {tabIndex === 2 && (
            <Box>
              {/* Header & Auto-Sync Stats Bar */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      🎙️ Expert Talks & Industry Intelligence Hub
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Auto-synced from 4 primary publications: Construction Week India, Architectural Digest India, ET Realty & Construction World
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={syncingTalks}
                    startIcon={syncingTalks ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                    onClick={handleManualSyncTalks}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {syncingTalks ? 'Syncing Feeds...' : 'Sync Now'}
                  </Button>
                </Box>

                {/* Auto Update Metrics Banner */}
                <Grid container spacing={2} sx={{ pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>Last Successful Update:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {expertStats.lastSuccessfulSyncAt ? new Date(expertStats.lastSuccessfulSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(expertStats.lastSuccessfulSyncAt).toLocaleDateString() : 'Just Now'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>Next Scheduled Sync:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="secondary">
                      In ~6 Hours (Auto-Job Active)
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>New Articles Today:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      🔥 {expertStats.articlesTodayCount || expertTalks.length} Articles
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>Active Sources:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      🏛️ {expertStats.activePublicationsCount || 4} Publications
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Publication Filter Chips */}
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ alignSelf: 'center', mr: 1, fontWeight: 'bold', color: '#1565c0' }}>Publications:</Typography>
                {['All', 'Construction Week India', 'Architectural Digest India', 'ET Realty', 'Construction World'].map(pub => (
                  <Chip
                    key={pub}
                    label={pub === 'All' ? 'All Publications (4)' : pub}
                    onClick={() => setExpertPublication(pub)}
                    color={expertPublication === pub ? 'primary' : 'default'}
                    variant={expertPublication === pub ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  />
                ))}
              </Box>

              {/* Category Filter Chips & Search Bar */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search expert talks by speaker, title, topic, or keyword..."
                      value={expertSearch}
                      onChange={(e) => setExpertSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: expertSearch && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setExpertSearch('')}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={expertCategory}
                        label="Category"
                        onChange={(e) => setExpertCategory(e.target.value)}
                      >
                        <MenuItem value="All">All Categories</MenuItem>
                        <MenuItem value="Architecture">Architecture</MenuItem>
                        <MenuItem value="Civil Engineering">Civil Engineering</MenuItem>
                        <MenuItem value="Prefab & Mivan">Prefab & Mivan</MenuItem>
                        <MenuItem value="BIM & AI">BIM & AI</MenuItem>
                        <MenuItem value="RERA & Legal">RERA & Legal</MenuItem>
                        <MenuItem value="Real Estate & PropTech">Real Estate & PropTech</MenuItem>
                        <MenuItem value="Building Materials">Building Materials</MenuItem>
                        <MenuItem value="Sustainability & Green Building">Sustainability & Green Building</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={expertSort}
                        label="Sort By"
                        onChange={(e) => setExpertSort(e.target.value)}
                      >
                        <MenuItem value="default">Featured First</MenuItem>
                        <MenuItem value="latest">Latest Published</MenuItem>
                        <MenuItem value="title">Title (A-Z)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* Featured Keynotes & Interviews Banner */}
              {expertTalks.some(a => a.isFeatured) && expertPublication === 'All' && !expertSearch && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#1565c0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⭐ Featured Tycoon Keynotes & Breakthrough Talks
                  </Typography>
                  <Grid container spacing={3}>
                    {expertTalks.filter(a => a.isFeatured).slice(0, 2).map((item) => (
                      <Grid item xs={12} md={6} key={item._id || item.canonicalUrl}>
                        <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, borderRadius: 3, border: '2px solid #1565c0', overflow: 'hidden', boxShadow: 3 }}>
                          <CardMedia
                            component="img"
                            sx={{ width: { xs: '100%', sm: 220 }, height: 220, objectFit: 'cover' }}
                            image={resolveMediaUrl(item.imageUrl)}
                            alt={item.title}
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Chip label="⭐ FEATURED" color="error" size="small" sx={{ fontWeight: 'bold', fontSize: '10px' }} />
                              <Chip label={item.publication} color="primary" size="small" sx={{ fontWeight: 'bold', fontSize: '10px' }} />
                              <Chip label={item.contentType || 'Interview'} color="secondary" variant="outlined" size="small" sx={{ fontSize: '10px' }} />
                            </Box>

                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '15px', lineHeight: 1.3, mb: 1 }}>
                              {item.title}
                            </Typography>

                            <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              🗣️ Speaker: {item.speaker}
                            </Typography>

                            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.summary}
                            </Typography>

                            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="textSecondary">
                                📅 {new Date(item.publishDate).toLocaleDateString()} | ⏱️ {item.readTime || '5 min read'}
                              </Typography>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => window.open(item.articleUrl, '_blank')}
                                sx={{ fontWeight: 'bold' }}
                              >
                                Read Full Article ↗
                              </Button>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Main Articles Grid */}
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#333', mb: 2 }}>
                📰 Industry Articles & Expert Keynotes ({expertTalks.length})
              </Typography>

              {loadingTalks ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress color="primary" />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Fetching latest expert talks and magazine feeds...
                  </Typography>
                </Box>
              ) : expertTalks.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 3 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No articles found matching selected filters.
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={() => { setExpertPublication('All'); setExpertCategory('All'); setExpertSearch(''); }}>
                    Reset Filters
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {expertTalks.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id || item.canonicalUrl}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={resolveMediaUrl(item.imageUrl)}
                            alt={item.title}
                            onError={(e: any) => { e.target.src = resolveMediaUrl(null); }}
                          />
                          <Chip
                            label={item.publication}
                            size="small"
                            color="secondary"
                            sx={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold', boxShadow: 1 }}
                          />
                          <Chip
                            label={item.category || 'Tech'}
                            size="small"
                            sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold', fontSize: '11px' }}
                          />
                        </Box>

                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                            <Chip label={item.contentType || 'Article'} size="small" variant="outlined" color="primary" sx={{ fontSize: '10px', height: 20 }} />
                            <Chip label={item.readTime || '4 min read'} size="small" variant="outlined" sx={{ fontSize: '10px', height: 20 }} />
                          </Box>

                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '15px', lineHeight: 1.3, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.title}
                          </Typography>

                          <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mb: 1, fontSize: '13px' }}>
                            🗣️ {item.speaker || 'Industry Expert'}
                          </Typography>

                          <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
                            {item.summary}
                          </Typography>

                          <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                            📅 {new Date(item.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | By {item.author || item.publication}
                          </Typography>

                          <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              color={bookmarkedArticles.includes(item.canonicalUrl) ? 'primary' : 'default'}
                              onClick={() => {
                                if (bookmarkedArticles.includes(item.canonicalUrl)) {
                                  setBookmarkedArticles(prev => prev.filter(c => c !== item.canonicalUrl));
                                } else {
                                  setBookmarkedArticles(prev => [...prev, item.canonicalUrl]);
                                }
                              }}
                            >
                              <BookmarkIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                const text = encodeURIComponent(`*${item.title}*\nRead latest expert talk on BuildMitra: ${item.articleUrl}`);
                                window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                              }}
                            >
                              <ShareIcon fontSize="small" />
                            </IconButton>

                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => window.open(item.articleUrl, '_blank')}
                              sx={{ fontWeight: 'bold', fontSize: '11px' }}
                            >
                              Read Full Article ↗
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* TAB 3: DESIGNS & GAMES */}
          {tabIndex === 3 && (
            <DesignGamesHub />
          )}

          {/* TAB 4: NEW MATERIALS & TECH WITH CATALOG UPLOAD */}
          {tabIndex === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  🚀 New Market Materials, Technology & Vendor Catalogs
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<CloudUploadIcon />} onClick={() => setOpenMatUpload(true)}>
                  Upload Material / Catalog
                </Button>
              </Box>

              <Grid container spacing={3}>
                {newMaterials.map((mat) => (
                  <Grid item xs={12} sm={6} key={mat.id}>
                    <Card sx={{ p: 3 }}>
                      <Chip label={mat.category} color="primary" size="small" sx={{ mb: 1 }} />
                      <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>{mat.name}</Typography>
                      <Typography variant="body2" paragraph>{mat.benefits}</Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={mat.price} color="success" size="small" />
                        <Button size="small" variant="contained" onClick={() => router.push('/marketplace')}>Explore Suppliers</Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 5: GUIDELINES & APPROVALS WITH UPLOAD BUTTON */}
          {tabIndex === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  📜 Statutory Guidelines: RERA, BDA, GBA, BMRDA & Land Approvals
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<CloudUploadIcon />} onClick={() => setOpenGuideUpload(true)}>
                  Add Guideline / Circular
                </Button>
              </Box>

              {guidelines.map((g) => (
                <Accordion key={g.id} defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">🏛️ {g.authority} — {g.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">{g.desc}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* TAB 6: REAL ESTATE GUIDE WITH UPLOAD BUTTON */}
          {tabIndex === 6 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  🏡 Real Estate Buyer & Seller Legal Verification Checklist
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<CloudUploadIcon />} onClick={() => setOpenRealEstateUpload(true)}>
                  Add Document Checklist Rule
                </Button>
              </Box>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>Mandatory Document Verification Checklist</Typography>
                <Grid container spacing={2}>
                  {realEstateDocs.map((doc, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Typography variant="body2" fontWeight="bold">✅ {doc}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          )}

          {/* TAB 7: FORMULAS & REFERENCE WITH UPLOAD BUTTON */}
          {tabIndex === 7 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  📐 Civil Engineering Formulas & Thumb Rule Gallery
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<CloudUploadIcon />} onClick={() => setOpenFormulaUpload(true)}>
                  Add Custom Formula
                </Button>
              </Box>

              {customFormulas.length > 0 && (
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#e8eaf6' }}>
                  <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>User Uploaded Engineering Formulas</Typography>
                  <Grid container spacing={2}>
                    {customFormulas.map(f => (
                      <Grid item xs={12} sm={6} key={f.id}>
                        <Paper sx={{ p: 2, borderLeft: '4px solid #1a237e' }}>
                          <Chip label={f.cat} size="small" color="primary" sx={{ mb: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold">{f.name}</Typography>
                          <Typography variant="body2" color="secondary" fontWeight="bold">{f.expr}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}

              <FormulaGallery />
            </Box>
          )}

          {/* TAB 8: LEADERBOARD & CERTS (WITH MOBILE & EMAIL COLUMNS) */}
          {tabIndex === 8 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🥇 Live Leaderboard & Certified Professionals
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Candidate Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mobile Number</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email Address</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score (%)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time Taken</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map((row, idx) => (
                      <TableRow key={row.id}>
                        <TableCell><strong>#{idx + 1}</strong></TableCell>
                        <TableCell><Typography fontWeight="bold" color="primary">{row.userName}</Typography></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon fontSize="small" color="secondary" /><Typography variant="body2">{row.mobile || 'N/A'}</Typography></Box></TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon fontSize="small" color="action" /><Typography variant="body2">{row.email || 'N/A'}</Typography></Box></TableCell>
                        <TableCell><Chip label={`${row.score}%`} color="success" size="small" /></TableCell>
                        <TableCell>{row.time}</TableCell>
                        <TableCell><code>{row.certId}</code></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

        </Container>

        {/* PREMIUM A4 DIGITAL CERTIFICATE DIALOG MODAL */}
        <Dialog open={openCertDialog} onClose={() => setOpenCertDialog(false)} maxWidth="md" fullWidth>
          <DialogContent sx={{ p: 2, bgcolor: '#0f172a' }}>
            {certificateData && (
              <Paper
                elevation={12}
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 5 },
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '12px double #b45309',
                  borderRadius: 4,
                  textAlign: 'center',
                  color: '#1e293b',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                  fontFamily: "'Georgia', 'Cinzel', serif"
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 44, color: '#d97706' }} />
                  <Typography variant="overline" sx={{ letterSpacing: 4, fontWeight: 'bold', color: '#b45309', fontSize: '14px' }}>
                    BUILDMITRA SUPERAPP OFFICIAL CREDENTIAL
                  </Typography>
                  <WorkspacePremiumIcon sx={{ fontSize: 44, color: '#d97706' }} />
                </Box>

                <Typography variant="h3" fontWeight="bold" sx={{ color: '#1a237e', fontFamily: "'Georgia', serif", letterSpacing: 2, mb: 1 }}>
                  CERTIFICATE OF EXCELLENCE
                </Typography>

                <Typography variant="subtitle1" sx={{ color: '#64748b', fontStyle: 'italic', mb: 3 }}>
                  This official digital master certificate is proudly awarded to
                </Typography>

                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif",
                    fontWeight: 800,
                    color: '#0d1445',
                    borderBottom: '3px dashed #d97706',
                    display: 'inline-block',
                    px: 4, py: 1, my: 1,
                    letterSpacing: 1.5,
                    textTransform: 'capitalize'
                  }}
                >
                  {certificateData.userName}
                </Typography>

                <Typography variant="body1" sx={{ mt: 3, mb: 4, maxWidth: 680, mx: 'auto', lineHeight: 1.8, fontSize: '16px' }}>
                  for outstanding professional achievement in passing the <strong>Civil Engineering & Construction Master Examination</strong> with an overall score of <strong>{certificateData.score}% ({certificateData.correctCount} / {certificateData.totalCount} Correct)</strong> completed in <strong>{certificateData.timeSpent}</strong> under IS Code specifications.
                </Typography>

                <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 4, pt: 3, borderTop: '2px solid #e2e8f0' }}>
                  <Grid item xs={4} textAlign="left">
                    <Typography variant="caption" display="block" color="textSecondary">Candidate Mobile:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">{certificateData.userPhone}</Typography>
                    <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>Candidate Email:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">{certificateData.userEmail}</Typography>
                  </Grid>

                  <Grid item xs={4} textAlign="center">
                    <Box sx={{
                      width: 90, height: 90, mx: 'auto', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      color: 'white', boxShadow: '0 8px 20px rgba(217,119,6,0.4)', border: '4px solid #fff'
                    }}>
                      <MilitaryTechIcon sx={{ fontSize: 36 }} />
                      <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '9px', letterSpacing: 1 }}>VERIFIED</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={4} textAlign="right">
                    <Typography variant="caption" display="block" color="textSecondary">Certificate ID:</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#b45309' }}>{certificateData.certId}</Typography>
                    <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>Issue Date:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">{certificateData.issueDate}</Typography>
                  </Grid>
                </Grid>

              </Paper>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#0f172a', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="success" startIcon={<WhatsAppIcon />} onClick={handleShareCertificateWhatsApp}>
              Send Certificate to WhatsApp
            </Button>
            <Button variant="contained" color="warning" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Print / Download A4 PDF
            </Button>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }} onClick={() => setOpenCertDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Education Resource Upload Modal */}
        <Dialog open={openEduUpload} onClose={() => setOpenEduUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Education Resource</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField fullWidth label="Title" value={newEduTitle} onChange={e => setNewEduTitle(e.target.value)} sx={{ mb: 2, mt: 1 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select value={newEduType} onChange={e => setNewEduType(e.target.value)}>
                <MenuItem value="Video">YouTube Video Link</MenuItem>
                <MenuItem value="Document">PDF Document / Blueprint</MenuItem>
                <MenuItem value="Image">Site Photography / Diagram</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Resource URL / File Link" value={newEduUrl} onChange={e => setNewEduUrl(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth multiline rows={3} label="Description" value={newEduDesc} onChange={e => setNewEduDesc(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEduUpload(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleAddEducationItem}>Upload</Button>
          </DialogActions>
        </Dialog>

        {/* New Material Catalog Upload Modal */}
        <Dialog open={openMatUpload} onClose={() => setOpenMatUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload New Material / Vendor Catalog</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField fullWidth label="Material / Product Name" value={newMatName} onChange={e => setNewMatName(e.target.value)} sx={{ mb: 2, mt: 1 }} />
            <TextField fullWidth label="Unit Price / Rate (e.g. ₹75/NOS)" value={newMatPrice} onChange={e => setNewMatPrice(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth multiline rows={3} label="Key Benefits & Specifications" value={newMatBenefits} onChange={e => setNewMatBenefits(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Catalog PDF / Video Link" value={newMatCatalogUrl} onChange={e => setNewMatCatalogUrl(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMatUpload(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={handleAddMaterialItem}>Publish Catalog</Button>
          </DialogActions>
        </Dialog>

        {/* Guideline Upload Modal */}
        <Dialog open={openGuideUpload} onClose={() => setOpenGuideUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Statutory Guideline / Circular</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField fullWidth label="Authority (e.g. RERA, BDA, BBMP)" value={newGuideAuthority} onChange={e => setNewGuideAuthority(e.target.value)} sx={{ mb: 2, mt: 1 }} />
            <TextField fullWidth label="Guideline Title" value={newGuideTitle} onChange={e => setNewGuideTitle(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth multiline rows={3} label="Guideline Details & Rules" value={newGuideDesc} onChange={e => setNewGuideDesc(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGuideUpload(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleAddGuideline}>Save Guideline</Button>
          </DialogActions>
        </Dialog>

        {/* Real Estate Document Checklist Upload Modal */}
        <Dialog open={openRealEstateUpload} onClose={() => setOpenRealEstateUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Property Legal Verification Checklist Item</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField fullWidth label="Document / Certificate Name" value={newReTitle} onChange={e => setNewReTitle(e.target.value)} sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRealEstateUpload(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleAddRealEstateDoc}>Add Checklist Item</Button>
          </DialogActions>
        </Dialog>

        {/* Formula Upload Modal */}
        <Dialog open={openFormulaUpload} onClose={() => setOpenFormulaUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Custom Engineering Formula</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField fullWidth label="Formula Title" value={newFormulaName} onChange={e => setNewFormulaName(e.target.value)} sx={{ mb: 2, mt: 1 }} />
            <TextField fullWidth label="Category" value={newFormulaCategory} onChange={e => setNewFormulaCategory(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Formula Expression / Equation" value={newFormulaExpr} onChange={e => setNewFormulaExpr(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFormulaUpload(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleAddFormula}>Save Formula</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}






