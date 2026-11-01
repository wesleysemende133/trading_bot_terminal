import React, { useEffect, useState } from 'react';
import { NewsApiClient } from '../../infrastructure/http/NewsApiClient';
import { Newspaper, ExternalLink, Zap } from 'lucide-react';

export function NewsPanel() {
  const [news, setNews] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      const [latestData, breakingData] = await Promise.all([
        NewsApiClient.getLatestNews(8),
        NewsApiClient.getBreakingNews(2),
      ]);

      if (isMounted) {
        setNews(latestData.articles || []);
        setBreaking(breakingData.articles || []);
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-tv-panel flex flex-col h-full">
      {/* Cabeçalho fixo */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-tv-border flex-shrink-0">
        <div className="flex items-center space-x-1.5">
          <Newspaper className="w-3 h-3 text-tv-blue" />
          <span className="text-[11px] font-bold text-white">Notícias</span>
        </div>
        <span className="text-[9px] text-gray-500">FCN</span>
      </div>

      {/* Área scrollável */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-2 text-[10px] text-gray-400 animate-pulse">A carregar...</div>
        ) : (
          <>
            {/* Breaking News */}
            {breaking.length > 0 && (
              <div className="px-3 py-1.5 bg-tv-red/10 border-b border-tv-border">
                <div className="flex items-center space-x-1 mb-1">
                  <Zap className="w-2.5 h-2.5 text-tv-red" />
                  <span className="text-[9px] font-bold text-tv-red uppercase">Breaking</span>
                </div>
                {breaking.slice(0, 2).map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[10px] text-tv-text hover:text-white truncate leading-tight"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            )}

            {/* Lista normal */}
            {news.length === 0 ? (
              <div className="px-3 py-2 text-[10px] text-gray-500">Sem notícias.</div>
            ) : (
              news.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-1.5 border-b border-tv-border/30 hover:bg-tv-border/50 transition-colors group"
                >
                  <div className="flex items-start justify-between space-x-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-tv-text group-hover:text-white leading-tight line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-[8px] text-gray-500 mt-0.5">
                        {item.source} {item.timeAgo && `• ${item.timeAgo}`}
                      </div>
                    </div>
                    <ExternalLink className="w-2.5 h-2.5 text-gray-600 group-hover:text-tv-blue flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
