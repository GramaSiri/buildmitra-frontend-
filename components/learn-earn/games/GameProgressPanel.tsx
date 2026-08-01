import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress, Stack, Button, Tooltip } from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Lightbulb as TipIcon
} from '@mui/icons-material';

export interface GameProgressData {
  gameId: string;
  gameName: string;
  score: number;
  bestScore: number;
  stars: number;
  level: number;
  badges: string[];
  attempts: number;
  completion: number;
}

interface GameProgressPanelProps {
  progress: GameProgressData;
  onSave?: () => void;
  onReset?: () => void;
  saving?: boolean;
}

export const BADGE_DEFINITIONS: Record<string, { label: string; icon: string; desc: string }> = {
  'layout-apprentice': { label: 'Layout Apprentice', icon: '📐', desc: 'Created your first 2D floor plan layout' },
  'space-planner': { label: 'Space Planner', icon: '🏛️', desc: 'Achieved >80% carpet area efficiency & circulation' },
  'elevation-artist': { label: 'Elevation Artist', icon: '🎨', desc: 'Designed a balanced 3-floor front elevation façade' },
  'concrete-technician': { label: 'Concrete Technician', icon: '🧪', desc: 'Successfully designed M20 mix & completed CTM test' },
  'beam-analyst': { label: 'Beam Analyst', icon: '📊', desc: 'Solved SFD & BMD for simply supported beam' },
  'structural-thinker': { label: 'Structural Thinker', icon: '🏗️', desc: 'Completed column grid & load path verification' },
  'site-engineer': { label: 'Site Engineer', icon: '👷', desc: 'Completed Building Assembly construction sequence' },
  'buildmitra-master': { label: 'BuildMitra Design Master', icon: '👑', desc: 'Earned 3 stars across all 5 engineering games' }
};

export const GameProgressPanel: React.FC<GameProgressPanelProps> = ({
  progress,
  onSave,
  onReset,
  saving = false
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1a237e 0%, #0d1445 100%)',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        {/* Game Title & Level */}
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffb74d', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon /> {progress.gameName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#e0e0e0' }}>
            Level {progress.level} • {progress.attempts} Attempts • Best Score: {progress.bestScore} / 100
          </Typography>
        </Box>

        {/* Stars & Score Display */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', color: '#ffb74d' }}>
            {[1, 2, 3].map(s => (
              <StarIcon key={s} sx={{ opacity: s <= progress.stars ? 1 : 0.3, fontSize: 26 }} />
            ))}
          </Box>

          <Box sx={{ textAlign: 'center', px: 2, py: 0.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <Typography variant="caption" display="block" color="#b0bec5">CURRENT SCORE</Typography>
            <Typography variant="h6" fontWeight="bold" color="#00e676">{progress.score} / 100</Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          {onSave && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={saving}
              sx={{ fontWeight: 'bold', borderRadius: 2 }}
            >
              {saving ? 'Saving...' : 'Save Design'}
            </Button>
          )}
          {onReset && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', borderRadius: 2 }}
            >
              Reset
            </Button>
          )}
        </Stack>
      </Box>

      {/* Progress Bar & Badges */}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="#b0bec5">Completion Progress</Typography>
          <Typography variant="caption" color="#ffb74d" fontWeight="bold">{progress.completion}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress.completion}
          sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00c853' } }}
        />

        {/* Badges Earned */}
        {progress.badges && progress.badges.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="#b0bec5" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WorkspacePremiumIcon fontSize="small" sx={{ color: '#ffb74d' }} /> Badges:
            </Typography>
            {progress.badges.map(bKey => {
              const b = BADGE_DEFINITIONS[bKey] || { label: bKey, icon: '🏆', desc: 'Achievement Unlocked' };
              return (
                <Tooltip key={bKey} title={b.desc}>
                  <Chip
                    size="small"
                    label={`${b.icon} ${b.label}`}
                    sx={{ bgcolor: 'rgba(255,183,77,0.2)', color: '#ffe082', border: '1px solid #ffb74d', fontWeight: 'bold' }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
};
