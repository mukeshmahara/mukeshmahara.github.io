import { ArrowRight, CalendarDays, Trophy } from "lucide-react";

const LatestDraw = ({ draw, onView }) => {
  if (!draw) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
              <Trophy className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest Draw
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {draw.name}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-4 w-4" />
                {draw.date}
              </div>
            </div>
          </div>

          <button
            onClick={() => onView?.(draw.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            View Draw
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {draw.winners?.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Top Winner
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">
              {draw.winners[0].name || draw.winners[0].winner}
            </span>

            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {draw.winners[0].prize}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestDraw;
