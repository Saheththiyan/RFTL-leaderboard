import React from 'react';
import styles from './LeaderboardItem.module.css';

interface LeaderboardItemProps {
    rank: number;
    name: string;
    score: number;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ rank, name, score }) => {
    let rankClass = styles.item;
    if (rank === 1) rankClass += ` ${styles.gold}`;
    else if (rank === 2) rankClass += ` ${styles.silver}`;
    else if (rank === 3) rankClass += ` ${styles.bronze}`;

    return (
        <div className={rankClass}>
            <div className={styles.rank}>{rank}</div>
            <div className={styles.name}>{name}</div>
            <div className={styles.score}>{score}</div>
        </div>
    );
};
