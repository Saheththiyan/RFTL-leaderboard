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

  // 1. Calculate Ranks for EVERYONE first (Dense Ranking)
  const allRankedParticipants = useMemo<RankedParticipant[]>(() => {
    if (participants.length === 0) return [];

    // Create a copy and sort
    const sorted = [...participants].sort((a, b) => b.score - a.score);

    let currentRank = 1;
    let lastScore = sorted[0]?.score;

    return sorted.map((p, index) => {
      // If score is different from previous, increment rank by 1 (dense ranking)
      // Note: Standard competition ranking would be index + 1
      // User requested: "if two people share the same score, they should be in the same place. no need to eliminate the next immediate place"
      // This implies 100, 100, 90 -> 1st, 1st, 2nd
      if (index > 0 && p.score < lastScore) {
        currentRank++;
        lastScore = p.score;
      }
      return { ...p, rank: currentRank };
    });
  }, [participants]);

  // 2. Paginate the ranked list
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
        Showing {currentParticipants.length} of {participants.length} Participants
      </footer>
    </div>
  );
}

export default App;
