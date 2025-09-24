import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Game2048.css';

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

interface Game2048Props {
  theme?: 'light' | 'dark' | 'auto';
}

const Game2048: React.FC<Game2048Props> = ({ theme = 'auto' }) => {
  const [board, setBoard] = useState<(Tile | null)[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [tileIdCounter, setTileIdCounter] = useState(0);
  
  // 触摸事件相关状态
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // 主题检测
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const htmlTheme = document.documentElement.getAttribute('data-theme');
        setIsDarkMode(htmlTheme === 'dark' || (htmlTheme !== 'light' && prefersDark));
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };

    updateTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      mediaQuery.addEventListener('change', handleChange);

      const observer = new MutationObserver(() => updateTheme());
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
        observer.disconnect();
      };
    }
  }, [theme]);

  // 初始化游戏
  const initGame = useCallback(() => {
    const newBoard: (Tile | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
    let counter = 0;
    
    // 添加两个初始方块
    const positions = getRandomEmptyPositions(newBoard, 2);
    positions.forEach(([row, col]) => {
      newBoard[row][col] = {
        id: counter++,
        value: Math.random() < 0.9 ? 2 : 4,
        row,
        col,
        isNew: true
      };
    });

    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setTileIdCounter(counter);
  }, []);

  // 获取随机空位置
  const getRandomEmptyPositions = (board: (Tile | null)[][], count: number): [number, number][] => {
    const emptyPositions: [number, number][] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!board[row][col]) {
          emptyPositions.push([row, col]);
        }
      }
    }
    
    const selected: [number, number][] = [];
    for (let i = 0; i < Math.min(count, emptyPositions.length); i++) {
      const randomIndex = Math.floor(Math.random() * emptyPositions.length);
      selected.push(emptyPositions.splice(randomIndex, 1)[0]);
    }
    return selected;
  };

  // 移动逻辑
  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || gameWon) return;

    const newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;
    let counter = tileIdCounter;

    // 清除之前的状态
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (newBoard[row][col]) {
          newBoard[row][col]!.isNew = false;
          newBoard[row][col]!.isMerged = false;
        }
      }
    }

    const moveAndMerge = (tiles: (Tile | null)[]): (Tile | null)[] => {
      // 移除空格
      const nonEmptyTiles = tiles.filter(tile => tile !== null) as Tile[];
      const result: (Tile | null)[] = Array(4).fill(null);
      
      let resultIndex = 0;
      for (let i = 0; i < nonEmptyTiles.length; i++) {
        const currentTile = nonEmptyTiles[i];
        
        if (i < nonEmptyTiles.length - 1 && 
            nonEmptyTiles[i + 1] && 
            currentTile.value === nonEmptyTiles[i + 1].value) {
          // 合并
          const mergedValue = currentTile.value * 2;
          result[resultIndex] = {
            id: counter++,
            value: mergedValue,
            row: currentTile.row,
            col: currentTile.col,
            isMerged: true
          };
          newScore += mergedValue;
          
          if (mergedValue === 2048 && !gameWon) {
            setGameWon(true);
          }
          
          i++; // 跳过下一个方块
          moved = true;
        } else {
          result[resultIndex] = { ...currentTile };
          if (resultIndex !== tiles.indexOf(currentTile)) {
            moved = true;
          }
        }
        resultIndex++;
      }
      
      return result;
    };

    // 根据方向处理移动
    if (direction === 'left' || direction === 'right') {
      for (let row = 0; row < 4; row++) {
        const rowTiles = [...newBoard[row]];
        if (direction === 'right') {
          rowTiles.reverse();
        }
        
        const movedRow = moveAndMerge(rowTiles);
        
        if (direction === 'right') {
          movedRow.reverse();
        }
        
        for (let col = 0; col < 4; col++) {
          newBoard[row][col] = movedRow[col];
          if (newBoard[row][col]) {
            newBoard[row][col]!.row = row;
            newBoard[row][col]!.col = col;
          }
        }
      }
    } else {
      for (let col = 0; col < 4; col++) {
        const colTiles = [];
        for (let row = 0; row < 4; row++) {
          colTiles.push(newBoard[row][col]);
        }
        
        if (direction === 'down') {
          colTiles.reverse();
        }
        
        const movedCol = moveAndMerge(colTiles);
        
        if (direction === 'down') {
          movedCol.reverse();
        }
        
        for (let row = 0; row < 4; row++) {
          newBoard[row][col] = movedCol[row];
          if (newBoard[row][col]) {
            newBoard[row][col]!.row = row;
            newBoard[row][col]!.col = col;
          }
        }
      }
    }

    if (moved) {
      // 添加新方块
      const emptyPositions = getRandomEmptyPositions(newBoard, 1);
      if (emptyPositions.length > 0) {
        const [row, col] = emptyPositions[0];
        newBoard[row][col] = {
          id: counter++,
          value: Math.random() < 0.9 ? 2 : 4,
          row,
          col,
          isNew: true
        };
      }

      setBoard(newBoard);
      setScore(newScore);
      setTileIdCounter(counter);

      // 检查游戏结束
      if (isGameOver(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, score, gameOver, gameWon, tileIdCounter]);

  // 检查游戏是否结束
  const isGameOver = (board: (Tile | null)[][]): boolean => {
    // 检查是否有空格
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!board[row][col]) return false;
      }
    }

    // 检查是否可以合并
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = board[row][col]!.value;
        if ((col < 3 && board[row][col + 1]?.value === current) ||
            (row < 3 && board[row + 1][col]?.value === current)) {
          return false;
        }
      }
    }

    return true;
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      // 防止浏览器默认行为
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) {
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // 最小滑动距离阈值
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return;
    }

    // 防止页面滚动和刷新
    e.preventDefault();
    e.stopPropagation();

    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (deltaX > 0) {
        move('right');
      } else {
        move('left');
      }
    } else {
      // 垂直滑动
      if (deltaY > 0) {
        move('down');
      } else {
        move('up');
      }
    }

    touchStartRef.current = null;
  }, [move]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // 防止页面滚动和下拉刷新
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 初始化游戏
  useEffect(() => {
    initGame();
    const savedBestScore = localStorage.getItem('game2048-best-score');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
  }, [initGame]);

  // 更新最高分
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('game2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  // 获取方块颜色
  const getTileColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  };

  // 获取文字颜色
  const getTextColor = (value: number): string => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };

  return (
    <div className={`game-2048 ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="game-header">
        <h1>2048</h1>
        <div className="score-container">
          <div className="score-box">
            <div className="score-label">分数</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-box">
            <div className="score-label">最高分</div>
            <div className="score-value">{bestScore}</div>
          </div>
        </div>
      </div>

      <div className="game-info">
        <p>使用方向键移动方块，相同数字的方块会合并！</p>
        <p className="mobile-hint">在移动设备上可以滑动屏幕来控制</p>
        <button className="new-game-btn" onClick={initGame}>
          新游戏
        </button>
      </div>

      <div 
        className="game-container"
        ref={gameContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div className="grid-container">
          {Array(16).fill(null).map((_, index) => (
            <div key={index} className="grid-cell" />
          ))}
        </div>
        
        <div className="tile-container">
          {board.flat().filter(tile => tile !== null).map(tile => {
            // 根据屏幕尺寸动态计算方块位置
            const getPositionForTile = (row: number, col: number) => {
              // 获取当前屏幕宽度
              const screenWidth = window.innerWidth;
              
              // 根据屏幕宽度设置对应的尺寸参数，与CSS媒体查询保持一致
              let cellSize: number;
              let gap: number;
              let containerPadding: number;
              
              if (screenWidth <= 360) {
              // 对应 @media (max-width: 360px)
              cellSize = 50;  // .tile width/height
              gap = 6;        // .grid-container gap
              containerPadding = 8;  // .game-container padding
              } else if (screenWidth <= 480) {
              // 对应 @media (max-width: 480px)
              cellSize = 58;  // .tile width/height
              gap = 8;        // .grid-container gap
              containerPadding = 10; // .game-container padding
              } else {
              // 桌面端默认值
              cellSize = 107; // .tile width/height
              gap = 15;       // .grid-container gap
              containerPadding = 15; // .game-container padding
              }
              
              // 计算位置：容器内边距 + (格子大小 + 间隙) * 索引
              const left = containerPadding + (cellSize + gap) * col;
              const top = containerPadding + (cellSize + gap) * row;
              
              return {
                left: `${left}px`,
                top: `${top}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                position: 'absolute' as const,
                zIndex: 10,
                'data-debug': `${screenWidth}px-${cellSize}x${cellSize}-gap${gap}-pad${containerPadding}-pos(${left},${top})`
              };
            };
              
            const positionStyle = getPositionForTile(tile!.row, tile!.col);
            
            return (
              <div
                key={tile!.id}
                className={`tile tile-${tile!.value} ${tile!.isNew ? 'tile-new' : ''} ${tile!.isMerged ? 'tile-merged' : ''}`}
                style={{
                  ...positionStyle,
                  backgroundColor: getTileColor(tile!.value),
                  color: getTextColor(tile!.value)
                }}
              >
                {tile!.value}
              </div>
            );
          })}
        </div>
      </div>

      {gameOver && (
        <div className="game-overlay">
          <div className="game-message">
            <h2>游戏结束!</h2>
            <p>最终分数: {score}</p>
            <button onClick={initGame}>再试一次</button>
          </div>
        </div>
      )}

      {gameWon && (
        <div className="game-overlay">
          <div className="game-message">
            <h2>恭喜！你赢了！</h2>
            <p>你成功合成了 2048！</p>
            <button onClick={() => setGameWon(false)}>继续游戏</button>
            <button onClick={initGame}>新游戏</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game2048;