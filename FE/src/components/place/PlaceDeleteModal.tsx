import { Trash2 } from "lucide-react";
import { Modal } from "@/components/feedback/Overlays";

export function PlaceDeleteModal({ onConfirm, onCancel }: { onConfirm(): void; onCancel(): void }) {
  return (
    <Modal onClose={onCancel}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <h2 className="text-[15px] font-bold text-gray-900 mb-2">정말 삭제할까요?</h2>
        <p className="text-[13px] text-gray-500 mb-6">삭제한 장소는 되돌릴 수 없습니다.</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            type="button"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors"
            type="button"
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
}
