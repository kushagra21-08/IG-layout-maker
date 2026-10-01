import React from 'react';
import { X, Trash2, ArrowRight, BookOpen, Sparkles, Smartphone, Square } from 'lucide-react';
import { LayoutTemplate, Photo } from '../types/layout';
import { autoAssignPhotos, deleteSavedLayoutFromStorage, getSavedLayouts } from '../utils/layoutEngine';

interface SavedLayoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onSelectLayout: (layout: LayoutTemplate, assignments: Record<string, string>) => void;
  onRefreshSaved: () => void;
}

export const SavedLayoutsModal: React.FC<SavedLayoutsModalProps> = ({
  isOpen,
  onClose,
  photos,
  onSelectLayout,
  onRefreshSaved,
}) => {
  if (!isOpen) return null;

  const savedList = getSavedLayouts();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedLayoutFromStorage(id);
    onRefreshSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#19191E] border border-[#2B2B33] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#282830] flex items-center justify-between bg-[#151518]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E29D72]/20 text-[#E29D72] border border-[#E29D72]/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                My Saved Layouts & Templates
              </h2>
              <p className="text-xs text-[#9E9EA7]">
                Saved Pinterest extractions and custom layouts ready to reuse for future outing dumps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9E9EA7] hover:text-white hover:bg-[#25252D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3">
          {savedList.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#24242C] flex items-center justify-center text-[#7C7C85]">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-white">No saved layouts yet</p>
              <p className="text-xs text-[#8E8E98] max-w-sm mx-auto">
                Extract layouts from Pinterest or save your customized layouts in the editor to build your personal layout collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedList.map((layout) => {
                const assignments = autoAssignPhotos(layout.slots, photos);
                return (
                  <div
                    key={layout.id}
                    onClick={() => {
                      onSelectLayout(layout, assignments);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-[#151518] hover:bg-[#1E1E25] border border-[#272730] hover:border-[#E29D72] cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white group-hover:text-[#E29D72] transition-colors truncate max-w-[160px]">
                          {layout.name}
                        </span>
                        <button
                          onClick={(e) => handleDelete(layout.id, e)}
                          className="text-[#7A7A85] hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete layout"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-[#A0A0AB]">
                        <span className="font-mono uppercase">
                          {layout.format === 'story'
                            ? '9:16 Story'
                            : layout.format === 'square'
                            ? '1:1 Square'
                            : '4:5 Feed'}
                        </span>
                        <span>•</span>
                        <span>{layout.slots.length} photo slots</span>
                        <span>•</span>
                        <span className="capitalize">{layout.styleType}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#23232A] flex items-center justify-between text-xs text-[#E29D72]">
                      <span className="text-[11px] font-medium">Use with current dump</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
