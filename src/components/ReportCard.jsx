import { Link } from "react-router-dom";
import { Search, MessageCircle, CheckCircle, Trash2, MapPin } from "lucide-react";
import { markReturned, deleteReport } from "../services/lostFoundService";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

export default function ReportCard({ report, currentUid }) {
  const isOwner = report.reporterId === currentUid;
  const isLost = report.type === "lost";

  async function handleReturned() {
    try {
      await markReturned(report.id);
    } catch (err) {
      console.error(err);
      alert("Could not update this report.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this report?")) return;
    try {
      await deleteReport(report.id);
    } catch (err) {
      console.error(err);
      alert("Could not delete this report.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {report.imageUrl ? (
          <img src={report.imageUrl} alt={report.title} className="h-full w-full object-cover" />
        ) : (
          <Search className="h-10 w-10 text-gray-300" />
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 break-words">{report.title}</h3>
          <span
            className={`shrink-0 rounded-full text-xs font-medium px-2 py-1 ${
              isLost ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isLost ? "Lost" : "Found"}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {report.category} · {formatDate(report.date)} · {report.hostelBlock}
        </p>

        {report.location && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.location}
          </p>
        )}

        {report.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{report.description}</p>
        )}

        <p className="text-xs text-gray-400 mt-2">Reported by {report.reporterName}</p>

        <div className="mt-auto pt-4 flex gap-2">
          {isOwner ? (
            <>
              <button
                onClick={handleReturned}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 text-sm py-2 hover:bg-gray-50"
              >
                <CheckCircle className="h-4 w-4" />
                Mark returned
              </button>
              <button
                onClick={handleDelete}
                aria-label="Delete report"
                className="rounded-lg border border-gray-300 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to={`/chat/${report.reporterId}`}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 text-white text-sm py-2 hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              {isLost ? "I found this" : "This is mine"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}