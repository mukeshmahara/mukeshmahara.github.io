const DrawsPageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>

      <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-16 border-b border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
    </div>
  );
};

export default DrawsPageSkeleton;
