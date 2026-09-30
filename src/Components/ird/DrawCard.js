import { CalendarDays, Trophy, Users } from "lucide-react";

const DrawCard = ({ draw, active, onClick }) => {
  return (
    <button
      onClick={() => onClick(draw.id)}
      className={`w-full rounded-xl border p-5 text-left transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
          : "border-gray-200 bg-white hover:border-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`rounded-lg p-2 ${
            active
              ? "bg-white/10 dark:bg-gray-900/10"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Trophy className="h-5 w-5" />
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            active
              ? "bg-white/10 dark:bg-gray-900/10"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {draw.status || "Completed"}
        </span>
      </div>

      <h3 className="mt-4 font-semibold">{draw.name}</h3>

      <div
        className={`mt-3 space-y-2 text-sm ${
          active
            ? "text-gray-300 dark:text-gray-600"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {draw.date}
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {draw.participants} participants
        </div>
      </div>
    </button>
  );
};

export default DrawCard;
