import { useEffect, useMemo, useState } from "react";

import DrawCard from "./DrawCard";
import DrawDetails from "./DrawDetails";
import DrawFilters from "./DrawFilters";
import DrawStats from "./DrawStats";
import DrawsPageSkeleton from "./DrawsPageSkeleton";
import LatestDraw from "./LatestDraw";
import WinnerList from "./WinnerList";

const DrawsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDraw, setSelectedDraw] = useState("all");

  useEffect(() => {
    const loadDraws = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/winners-data.json");

        if (!response.ok) {
          throw new Error(`Failed to load winners data (${response.status})`);
        }

        const json = await response.json();

        setData(json);
      } catch (err) {
        console.error("Failed to load draw data:", err);
        setError("Unable to load prize draw data.");
      } finally {
        setLoading(false);
      }
    };

    loadDraws();
  }, []);

  const draws = useMemo(() => {
    if (!data) return [];

    /*
     * Expected structure:
     *
     * {
     *   draws: [
     *     {
     *       id,
     *       name,
     *       date,
     *       status,
     *       participants,
     *       winners: [...]
     *     }
     *   ]
     * }
     *
     * If your JSON is directly an array, this also supports it.
     */

    if (Array.isArray(data)) {
      return data;
    }

    return data.draws || data.data || [];
  }, [data]);

  const latestDraw = useMemo(() => {
    if (!draws.length) return null;

    return [...draws].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    })[0];
  }, [draws]);

  const activeDraw = useMemo(() => {
    if (selectedDraw === "all") {
      return latestDraw;
    }

    return draws.find((draw) => String(draw.id) === String(selectedDraw));
  }, [draws, selectedDraw, latestDraw]);

  const allWinners = useMemo(() => {
    return draws.flatMap((draw) =>
      (draw.winners || []).map((winner) => ({
        ...winner,
        drawId: draw.id,
        drawName: draw.name,
        drawDate: draw.date,
      })),
    );
  }, [draws]);

  const filteredWinners = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return allWinners.filter((winner) => {
      const matchesDraw =
        selectedDraw === "all" ||
        String(winner.drawId) === String(selectedDraw);

      if (!matchesDraw) return false;

      if (!normalizedSearch) return true;

      const searchableText = [
        winner.name,
        winner.winner,
        winner.ticket,
        winner.prize,
        winner.status,
        winner.drawName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [allWinners, search, selectedDraw]);

  const stats = useMemo(() => {
    const totalParticipants = draws.reduce(
      (total, draw) => total + Number(draw.participants || 0),
      0,
    );

    return {
      totalDraws: draws.length,
      totalWinners: allWinners.length,
      totalParticipants,
      totalPrizes: allWinners.length,
    };
  }, [draws, allWinners]);

  const handleDrawSelect = (drawId) => {
    setSelectedDraw(drawId);
    setSearch("");
  };

  const handleViewLatestDraw = (drawId) => {
    setSelectedDraw(drawId);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return <DrawsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Unable to load prize draws
        </h2>

        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!draws.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          No prize draws found
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          There are currently no prize draw records available.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          IRD Prize Draw
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Prize Draws & Winners
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          View prize draw results, winning tickets, and winner information.
        </p>
      </div>

      {/* Statistics */}
      <DrawStats stats={stats} />

      {/* Latest Draw */}
      {latestDraw && (
        <LatestDraw draw={latestDraw} onView={handleViewLatestDraw} />
      )}

      {/* Draw Selection */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Prize Draws
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select a draw to view its winners.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {draws.map((draw) => (
            <DrawCard
              key={draw.id}
              draw={draw}
              active={
                selectedDraw !== "all" &&
                String(selectedDraw) === String(draw.id)
              }
              onClick={handleDrawSelect}
            />
          ))}
        </div>
      </div>

      {/* Selected Draw Details */}
      <DrawDetails draw={activeDraw} />

      {/* Filters */}
      <DrawFilters
        search={search}
        setSearch={setSearch}
        selectedDraw={selectedDraw}
        setSelectedDraw={setSelectedDraw}
        draws={draws}
      />

      {/* Winners */}
      <WinnerList winners={filteredWinners} />
    </section>
  );
};

export default DrawsPage;
