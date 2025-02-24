import { useState, useEffect } from "react";

export default function Board() {
  const boardSize = 20; // 定义棋盘的大小，比如 4x4
  const winLength = 5;
  const rows = Array.from({ length: boardSize }, (_, rowIndex) => rowIndex);
  const cols = Array.from({ length: boardSize }, (_, colIndex) => colIndex);
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(boardSize).fill(null));
  const [clickhistory, setclickhistory] = useState([]);
  const [winnerX, setwinnerX] = useState(0);
  const [winnerO, setwinnerO] = useState(0);
  const [click, setclick] = useState(0);
  const clicks = Array.from({ length: click }, (_, clickIndex) => clickIndex);
  const [winline, setwinline] = useState([]);
  function handleClick(i) {
    const nextSquares = squares.slice();
    if (nextSquares[i]) {
      //console.log("Squares", i, "can not clicked!");
      return;
    }
    if (calculateWinner(squares, boardSize, winLength)) {
      return;
    }
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    const newclickhistory = clickhistory.slice(0, click);
    setclick(click + 1);
    newclickhistory.push({
      click: click,
      Squares: nextSquares,
      xIsNext: !xIsNext,
    });
    setclickhistory(newclickhistory);
    setXIsNext(!xIsNext);
    //console.log("$clicked!", nextSquares, newclickhistory);
    // if (newclickhistory.length >= 7) {
    //   CNT6 = newclickhistory.length - 6;
    //   nextSquares[CNT6] = null;
    //   console.log("$clicked!", nextSquares, newclickhistory);
    // }
    setSquares(nextSquares);
  }
  //console.log("$clickhistory!", click, clickhistory);
  const result = calculateWinner(squares, boardSize, winLength);
  let status;
  if (result) {
    status = "Winner: " + result.winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }
  useEffect(() => {
    if (result) {
      if (result.winner === "X") {
        setwinnerX(winnerX + 1);
      } else {
        setwinnerO(winnerO + 1);
      }
      setwinline(result.winline);
    }
  }, [squares]);

  function restart() {
    setSquares([]);
    setclickhistory([]);
    setXIsNext(xIsNext);
    setwinline([]);
    setclick(0);
  }

  function jumpTo(i) {
    setSquares([]);
    const clickhistorys = clickhistory.slice();
    //console.log("$jumpTo!", i, clickhistorys);
    const history = clickhistorys[i];
    setclick(i + 1);
    setwinline([]);
    setXIsNext(history.xIsNext);
    setSquares(history.Squares);
    const newclickhistory = clickhistory.slice(0, i + 1);
    setclickhistory(newclickhistory);
    //console.log("$jumpTo83", click, newclickhistory);
  }
  let description;
  if (click > 0) {
    description = "Go to move #";
  } else {
    description = "Go to game start";
  }
  return (
    <>
      <div className="status">{status} </div>
      <div>
        <li className="winner">X win : {winnerX} </li>
        <li className="winner">
          O win : {winnerO}
          <button className="restart" onClick={restart}>
            restart
          </button>
        </li>
      </div>
      <div className="table">
        {rows.map((row) => (
          <div key={row} className="board-row">
            {cols.map((col) => {
              const index = row * boardSize + col; // 计算格子在 squares 数组中的索引
              return (
                <Square
                  key={index}
                  value={squares[index]}
                  iswinner={winline.includes(index)}
                  onSquareClick={() => handleClick(index)}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="table_move">
        {clicks.map((clickindex) => (
          <div key={clickindex} className="move">
            <button onClick={() => jumpTo(clickindex)}>
              {description}
              {clickindex}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
function Square({ value, iswinner, onSquareClick }) {
  //const [value, setValue] = useState(null);
  // function handleClick() {
  //   setValue('X');
  //   console.log('$clicked!',value);
  // }
  //console.log('$iswinner!',value,iswinner);
  return (
    <button
      className={`square ${iswinner ? "square-winner" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}
function calculateWinner(squares, boardSize = 10, winLength = 5) {
  // 辅助函数：检测一条线上是否有连续的 winLength 个相同棋子
  function checkLine(start, direction) {
    const symbol = squares[start]; // 起点的棋子
    //if (!symbol) return null; // 空格子跳过

    const positions = [start]; // 存储连续赢的索引
    for (let i = 1; i < winLength; i++) {
      const next = start + i * direction;

      // 检查是否越界（横、纵、斜线规则不同）
      const rowDiff =
        Math.floor(next / boardSize) - Math.floor(start / boardSize);
      if (
        (direction === 1 && rowDiff !== 0) || // 横向：不允许跨行
        (direction === boardSize && next >= squares.length) || // 纵向：确保在边界内
        (direction === boardSize + 1 && Math.abs(rowDiff) !== i) || // 右下斜
        (direction === boardSize - 1 && Math.abs(rowDiff) !== i) // 左下斜
      ) {
        return null;
      }

      // 如果下一位置没有连上同样的棋子，停止
      if (squares[next] !== symbol) return null;

      positions.push(next);
    }

    return positions; // 返回赢的位置
  }

  // 检查所有格子
  for (let i = 0; i < squares.length; i++) {
    // 跳过空格子
    if (!squares[i]) continue;

    // 检查4个方向：横向、纵向、右下斜、左下斜
    const directions = [1, boardSize, boardSize + 1, boardSize - 1];
    for (let dir of directions) {
      const line = checkLine(i, dir);
      if (line) {
        return {
          winner: squares[i], // 获胜的棋子（'X' 或 'O'）
          winline: line, // 获胜的棋子序列
        };
      }
    }
  }

  return null; // 没有胜利
}
