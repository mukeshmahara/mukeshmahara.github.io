import { Trophy, Users, Gift, CalendarDays } from "lucide-react";

const DrawStats = ({ stats }) => {
  const items = [
    {
      label: "Total Draws",
      value: stats.totalDraws,
      icon: CalendarDays,
    },
    {
      label: "Total Winners",
      value: stats.totalWinners,
      icon: Trophy,
    },
    {
      label: "Total Participants",
      value: stats.totalParticipants,
      icon: Users,
    },
    {
      label: "Total Prizes",
      value: stats.totalPrizes,
      icon: Gift,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {item.value}
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DrawStats;
