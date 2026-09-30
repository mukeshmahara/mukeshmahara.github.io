import { CalendarDays, Hash, Trophy, Users } from "lucide-react";

const DrawDetails = ({ draw }) => {
  if (!draw) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <Trophy className="mx-auto h-10 w-10 text-gray-400" />

        <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
          No draw selected
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select a draw to view its details.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 p-5 dark:border-gray-800">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Draw Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {draw.name}
            </h2>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {draw.status || "Completed"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-gray-400" />

          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium dark:text-white">{draw.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gray-400" />

          <div>
            <p className="text-xs text-gray-500">Participants</p>
            <p className="text-sm font-medium dark:text-white">
              {draw.participants}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-gray-400" />

          <div>
            <p className="text-xs text-gray-500">Winners</p>
            <p className="text-sm font-medium dark:text-white">
              {draw.winners?.length || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-gray-400" />

          <div>
            <p className="text-xs text-gray-500">Draw ID</p>
            <p className="text-sm font-medium dark:text-white">{draw.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawDetails;
