import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeToReports } from "../services/lostFoundService";
import ReportCard from "../components/ReportCard";

// Every word typed must appear somewhere in the report (case-insensitive)
function makeMatcher(queryText) {
  const terms = queryText.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return () => true;
  return (report) => {
    const haystack = [report.title, report.description, report.category, report.location]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  };
}

export default function LostFoundPage() {
  const { currentUser, profile } = useAuth();
  const [tab, setTab] = useState("lost"); // "lost" | "found"
  const [scope, setScope] = useState("all"); // "all" | "mine"
  const [search, setSearch] = useState("");
  const [lost, setLost] = useState(null); // null = still loading
  const [found, setFound] = useState(null);
  const [error, setError] = useState("");

  const myHostel = profile?.hostelBlock;

  // Listen to both sections so a search can look in the other one too
  useEffect(() => {
    // Wait for the profile so "my hostel" has a value
    if (scope === "mine" && !myHostel) return;

    setLost(null);
    setFound(null);
    setError("");

    const hostelBlock = scope === "mine" ? myHostel : undefined;
    const onError = (err) => {
      console.error("Reports listener error:", err);
      setError("Could not load reports.");
    };

    const unsubLost = subscribeToReports({ type: "lost", hostelBlock }, setLost, onError);
    const unsubFound = subscribeToReports({ type: "found", hostelBlock }, setFound, onError);

    return () => {
      unsubLost();
      unsubFound();
    };
  }, [scope, myHostel]);

  const matches = makeMatcher(search);
  const searching = search.trim().length > 0;

  const filteredLost = lost ? lost.filter(matches) : null;
  const filteredFound = found ? found.filter(matches) : null;

  const current = tab === "lost" ? filteredLost : filteredFound;
  const otherTab = tab === "lost" ? "found" : "lost";
  const otherList = tab === "lost" ? filteredFound : filteredLost;
  const otherCount = otherList ? otherList.length : 0;

  const tabClass = (active) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition ${
      active ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
    }`;

  const countLabel = (list) => (searching && list ? ` (${list.length})` : "");

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost &amp; Found</h1>
          <p className="text-sm text-gray-500">Help items find their way back to their owners</p>
        </div>
        <Link
          to="/lost-found/new"
          className="flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Report an item
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by item, colour, place... (e.g. blue bottle, calculator, library)"
          aria-label="Search lost and found reports"
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {searching && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button onClick={() => setTab("lost")} className={tabClass(tab === "lost")}>
            Lost{countLabel(filteredLost)}
          </button>
          <button onClick={() => setTab("found")} className={tabClass(tab === "found")}>
            Found{countLabel(filteredFound)}
          </button>
        </div>

        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          aria-label="Hostel filter"
        >
          <option value="all">All hostels</option>
          <option value="mine">My hostel{myHostel ? ` (${myHostel})` : ""}</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {current === null ? (
        <p className="text-gray-500">Loading reports...</p>
      ) : current.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          {searching ? (
            <>
              <p>
                No {tab} reports match &ldquo;{search.trim()}&rdquo;.
              </p>
              {otherCount > 0 && (
                <button
                  onClick={() => setTab(otherTab)}
                  className="mt-2 text-emerald-600 font-medium hover:underline"
                >
                  See {otherCount} match{otherCount === 1 ? "" : "es"} in {otherTab === "found" ? "Found" : "Lost"}
                </button>
              )}
            </>
          ) : (
            <>
              <p>No {tab} reports right now.</p>
              <Link to="/lost-found/new" className="text-emerald-600 font-medium hover:underline">
                Report an item
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {current.map((report) => (
            <ReportCard key={report.id} report={report} currentUid={currentUser.uid} />
          ))}
        </div>
      )}
    </div>
  );
}