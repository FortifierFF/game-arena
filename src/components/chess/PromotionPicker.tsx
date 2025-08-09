import { Button } from '@/components/ui/button';

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export default function PromotionPicker({ onSelect, onCancel }: { onSelect: (p: PromotionPiece) => void; onCancel: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg w-64">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Choose promotion</h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <Button size="sm" onClick={() => onSelect('q')}>Q</Button>
          <Button size="sm" variant="outline" onClick={() => onSelect('r')}>R</Button>
          <Button size="sm" variant="outline" onClick={() => onSelect('b')}>B</Button>
          <Button size="sm" variant="outline" onClick={() => onSelect('n')}>N</Button>
        </div>
        <div className="text-right">
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
} 