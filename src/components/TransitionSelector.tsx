import { TransitionType } from '../lib/transitionService';
import { getColorScheme } from '../lib/colorUtils';

interface TransitionSelectorProps {
  transitionType: TransitionType;
  onTransitionTypeChange: (type: TransitionType) => void;
  isDarkBackground?: boolean;
}

const transitionTypes: { value: TransitionType; label: string }[] = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'zoom-pulse', label: 'Zoom Pulse' },
  { value: 'collage', label: 'Collage' },
];

export default function TransitionSelector({
  transitionType,
  onTransitionTypeChange,
  isDarkBackground = true
}: TransitionSelectorProps) {
  const colors = getColorScheme(isDarkBackground);

  return (
    <div className="space-y-3">
      <label className={`block text-sm font-semibold ${colors.text}`}>
        Transition Effect
      </label>
      <select
        value={transitionType}
        onChange={(e) => onTransitionTypeChange(e.target.value as TransitionType)}
        className={`w-full ${colors.background} ${colors.border} border rounded-xl px-4 py-3 ${colors.text} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm`}
      >
        {transitionTypes.map((type) => (
          <option key={type.value} value={type.value} className={`${isDarkBackground ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}
