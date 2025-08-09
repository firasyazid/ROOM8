"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useState, useEffect } from "react";
import { getStatsDashboard, formatStatsDashboard } from "@/services/statService";
import { EyeIcon, UserCircleIcon } from "@/icons";

// Define the TypeScript interface for news articles
interface TopArticle {
  id: string;
  title: string;
  views: number;
  uniqueViewers: number;
}

export default function RecentOrders() {
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopNews = async () => {
      try {
        setLoading(true);
        const data = await getStatsDashboard();
        const formattedData = formatStatsDashboard(data);
        setTopArticles(formattedData.topArticles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch top articles');
        console.error('Error fetching top articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopNews();
}, []);

return (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top News Articles
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Most viewed articles today
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button  
            onClick={() => window.location.href = '/News'}
          
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <EyeIcon className="w-4 h-4" />
            View All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Loading top articles...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500 dark:text-red-400 text-center">
            <p>Error loading articles</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : topArticles.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <p>No articles found</p>
          </div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Rank
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Article Title
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Views
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Unique Viewers
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Engagement
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {topArticles.map((article, index) => (
                <TableRow key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-full">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-800 dark:text-white/90 line-clamp-2 leading-snug">
                        {article.title}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400 mt-1 block">
                        ID: {article.id.slice(-8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-800 dark:text-white/90">
                        {article.views.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-800 dark:text-white/90">
                        {article.uniqueViewers.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      size="sm"
                      color={
                        article.views > 10
                          ? "success"
                          : article.views > 5
                          ? "warning"
                          : "info"
                      }
                    >
                      {article.views > 10 ? "High" : article.views > 5 ? "Medium" : "Low"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
   );
}
