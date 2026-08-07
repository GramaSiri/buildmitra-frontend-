import { syncApprovedRatesFromBackend } from "../utils/masterRates";
import RCCWallCalculator from '../components/calculators/RCCWallCalculator';
export default function RCCWallCalculatorPage() {
  React.useEffect(() => { syncApprovedRatesFromBackend(); }, []); return <RCCWallCalculator />; }

