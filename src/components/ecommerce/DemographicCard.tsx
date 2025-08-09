"use client";
import { useState, useEffect } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getStatsDashboard, formatStatsDashboard } from "@/services/statService";
import Badge from "../ui/badge/Badge";

// Define the TypeScript interface for podcast stats
interface PodcastStat {
  id: string;
  date: string;
  starts: number;
  completions: number;
  completionRate: number;
}

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [podcastStats, setPodcastStats] = useState<PodcastStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcastData = async () => {
      try {
        setLoading(true);
        const data = await getStatsDashboard();
        const formattedData = formatStatsDashboard(data);
        setPodcastStats(formattedData.podcastStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch podcast data');
        console.error('Error fetching podcast data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcastData();
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Podcast Analytics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Performance metrics and completion rates
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Export Data
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 my-6">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Loading podcast analytics...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-40 my-6">
          <div className="text-red-500 dark:text-red-400 text-center">
            <p>Error loading podcast data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : podcastStats.length === 0 ? (
        <div className="flex items-center justify-center h-40 my-6">
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <p>No podcast data available</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 my-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {podcastStats.reduce((sum, p) => sum + p.starts, 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Starts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {podcastStats.reduce((sum, p) => sum + p.completions, 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Completions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {(podcastStats.reduce((sum, p) => sum + p.completionRate, 0) / podcastStats.length).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Completion</p>
            </div>
          </div>

          {/* Individual Podcast Cards */}
          <div className="space-y-4">
            {podcastStats.map((podcast, index) => (
              <div key={podcast.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15.834 12.244c0 1.168-.577 2.025-1.587 2.025-.503 0-1.002-.228-1.12-.648h-.043c-.118.416-.543.648-1.015.648-.77 0-1.259-.542-1.259-1.434v-.529c0-.844.481-1.4 1.226-1.4.262 0 .503.06.708.174.181-.9.767-1.05 1.067-1.05.417 0 .707.218.707.631 0 .307-.211.477-.491.477-.211 0-.359-.111-.359-.266 0-.07.028-.14.07-.175-.07-.07-.175-.105-.28-.105-.21 0-.42.175-.42.525v.07h.525c.28 0 .525.175.525.525v.664c0 .35-.245.595-.595.595-.28 0-.49-.175-.49-.455v-.035c.105-.07.175-.175.175-.315 0-.21-.175-.385-.385-.385s-.385.175-.385.385c0 .385.315.7.7.7z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white/90">
                        Podcast Episode #{index + 1}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{podcast.date}</p>
                    </div>
                  </div>
                  <Badge
                    color={
                      podcast.completionRate > 80
                        ? "success"
                        : podcast.completionRate > 50
                        ? "warning"
                        : "error"
                    }
                  >
                    {podcast.completionRate.toFixed(1)}% Complete
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {podcast.starts}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {podcast.completions}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Completion Progress</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {Math.min(podcast.completionRate, 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        podcast.completionRate > 80
                          ? "bg-green-500"
                          : podcast.completionRate > 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(podcast.completionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
