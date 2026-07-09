import { Route, Trash2 } from "lucide-react";

export function PlaceActionBar({
  canDelete,
  onOpenWalkRoute,
  onDeletePlace,
}: {
  canDelete: boolean;
  onOpenWalkRoute(): void;
  onDeletePlace(): void;
}) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        onClick={onOpenWalkRoute}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-[13px] font-bold text-gray-600 hover:border-gray-300 transition-all whitespace-nowrap"
        type="button"
      >
        <Route size={14} />
        길찾기
      </button>
      {canDelete && (
        <button
          onClick={onDeletePlace}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-red-100 bg-red-50 text-[13px] font-bold text-red-500 hover:bg-red-100 transition-all whitespace-nowrap"
          type="button"
        >
          <Trash2 size={13} />
          삭제
        </button>
      )}
    </div>
  );
}
