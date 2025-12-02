interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  cancelLabel: string;   // ← added
  deleteLabel: string;   // ← added
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title,
  message,
  loading = false,
  cancelLabel,
  deleteLabel,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>

        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            disabled={loading}
          >
            {deleteLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
