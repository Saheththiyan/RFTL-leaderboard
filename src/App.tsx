import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { LeaderboardItem } from './components/LeaderboardItem';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

interface Participant {
  id: string;
  name: string;
  score: number;
}

// Extended interface for internal use with rank
interface RankedParticipant extends Participant {
  rank: number;
}

function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        // Ensure data shapes are correct (handle potential string/number mismatches)
        const formatted = data.map((d: any) => ({
          id: String(d.id),
          name: d.name,
          score: Number(d.score)
        }));
        setParticipants(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setLoading(false);
      });
  }, []);

  // 1. Calculate Global Ranks for EVERYONE first (Dense Ranking)
  const globalRankedParticipants = useMemo<RankedParticipant[]>(() => {
    if (participants.length === 0) return [];

    // Sort all participants by score
    const sorted = [...participants].sort((a, b) => b.score - a.score);

    let currentRank = 1;
    let lastScore = sorted[0]?.score;

    return sorted.map((p, index) => {
      // Dense ranking: same score = same rank, next different score = next rank
      if (index > 0 && p.score < lastScore) {
        currentRank++;
        lastScore = p.score;
      }
      return { ...p, rank: currentRank };
    });
  }, [participants]);

  // 2. Filter by search query while preserving global ranks
  const allRankedParticipants = useMemo<RankedParticipant[]>(() => {
    if (searchQuery.trim() === '') {
      return globalRankedParticipants;
    }

    return globalRankedParticipants.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [globalRankedParticipants, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // 3. Paginate the filtered list (with global ranks preserved)
  const totalPages = Math.ceil(allRankedParticipants.length / itemsPerPage);
  const currentParticipants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allRankedParticipants.slice(start, start + itemsPerPage);
  }, [allRankedParticipants, currentPage]);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  if (loading) {
    return (
      <div className="app-container">
        <header className="header">
          <h1 className="title">RUN FOR THEIR<br /><span>LIVES</span></h1>
          <div className="loading">Loading Leaderboard...</div>
        </header>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">RUN FOR THEIR<br /><span>LIVES</span></h1>
        <div className="subtitle">LEADERBOARD</div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="leaderboard-list">
        {currentParticipants.length > 0 ? (
          currentParticipants.map((p) => (
            <LeaderboardItem
              key={p.id}
              rank={p.rank} // Helper now receives the pre-calculated global rank
              name={p.name}
              score={p.score}
            />
          ))
        ) : (
          <div className="no-data">No participants found.</div>
        )}
      </main>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>Previous</button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      <footer className="footer">
        {searchQuery ? (
          <>Found {allRankedParticipants.length} of {participants.length} Participants</>
        ) : (
          <>Showing {currentParticipants.length} of {participants.length} Participants</>
        )}
      </footer>
    </div>
  );
}

export default App;
