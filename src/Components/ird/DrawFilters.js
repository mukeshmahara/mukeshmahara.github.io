import { Search, X } from "lucide-react";

const DrawFilters = ({
  search,
  setSearch,
  selectedDraw,
  setSelectedDraw,
  draws,
}) => {
  const clearFilters = () => {
    setSearch("");
    setSelectedDraw("all");
  };

  const hasFilters = search || selectedDraw !== "all";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search winner, ticket number..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
        />
      </div>

      <select
        value={selectedDraw}
        onChange={(event) => setSelectedDraw(event.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white"
      >
        <option value="all">All Draws</option>

        {draws.map((draw) => (
          <option key={draw.id} value={draw.id}>
            {draw.name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
};

export default DrawFilters;
