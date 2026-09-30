import { Award, Hash, User } from "lucide-react";

const WinnerList = ({ winners }) => {
  if (!winners?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
        <Award className="mx-auto h-10 w-10 text-gray-400" />

        <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
          No winners found
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No winners match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">Winners</h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          List of prize draw winners
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">Winner</th>
              <th className="px-5 py-3">Ticket</th>
              <th className="px-5 py-3">Prize</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {winners.map((winner, index) => (
              <tr
                key={winner.id || `${winner.ticket}-${index}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="font-medium dark:text-white">
                      {winner.rank || index + 1}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {winner.name || winner.winner}
                      </p>

                      {winner.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {winner.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Hash className="h-4 w-4 text-gray-400" />
                    {winner.ticket}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {winner.prize}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {winner.status || "Winner"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WinnerList;
