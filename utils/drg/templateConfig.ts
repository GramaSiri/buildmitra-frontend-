/**
 * BUILDMITRA CAD TEMPLATE CONFIGURATION
 * Maps plot configurations and facing directions to professional SVG templates.
 */

export interface CadTemplateMapping {
  plotWidth: number;
  plotLength: number;
  facing: 'North' | 'South' | 'East' | 'West';
  templateFileName: string;
  description: string;
}

export const PROFESSIONAL_CAD_TEMPLATES: CadTemplateMapping[] = [
  {
    plotWidth: 40,
    plotLength: 60,
    facing: 'South',
    templateFileName: 'south_facing_40x60_gplus3.svg',
    description: 'Professional G+3 South Facing Master CAD Drawing (40x60 ft)'
  },
  {
    plotWidth: 30,
    plotLength: 40,
    facing: 'East',
    templateFileName: 'east_facing_30x40_gplus2.svg',
    description: 'Professional G+2 East Facing Master CAD Drawing (30x40 ft)'
  },
  {
    plotWidth: 30,
    plotLength: 50,
    facing: 'North',
    templateFileName: 'north_facing_30x50_gplus2.svg',
    description: 'Professional G+2 North Facing Master CAD Drawing (30x50 ft)'
  }
];

export function getMatchingCadTemplate(width: number, length: number, facing: string): string {
  const match = PROFESSIONAL_CAD_TEMPLATES.find(
    t => t.plotWidth === width && t.plotLength === length && t.facing.toLowerCase() === facing.toLowerCase()
  );
  // Fallback to default professional template if exact dimensions are custom
  return match ? `/cad-templates/${match.templateFileName}` : '/cad-templates/south_facing_40x60_gplus3.svg';
}