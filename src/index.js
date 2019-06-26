import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className='square'
            onClick={() => props.onClick()}
            style={props.color === 'red' ? { color: 'red' } : { color: 'black' }}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                color={this.props.winningLine[i] != null ? 'red' : ''}
            />
        );
    }

    render() {
        let output = null;
        for (let i = 0; i < this.props.size; i++) {
            let cells = null;
            for (let j = i * this.props.size; j < i * this.props.size + this.props.size; j++)
                cells = <>{cells}{this.renderSquare(j)}</>;
            output = (
                <>{output}
                    <div className="board-row">{cells}</div>
                </>
            );
        }
        return <div>{output}</div>;
    }
}

class Game extends React.Component {
    // I added a new field to history called "lastMove" which remembers each move.
    boardSize = 3; // This is the board size which is no longer limited to 3!
    state = {
        history: [{ squares: Array(this.boardSize ** 2).fill(null), lastMove: null }],
        stepNumber: 0,
        xIsNext: true,
        movesReversed: false
    };

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i])
            return;
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        // Here I convert the square number to row/col format and update history with it.
        const lastMove = ' (row: ' + (Math.floor(i / this.boardSize) + 1) + ' col: ' + ((i % this.boardSize) + 1) + ')';
        this.setState({
            history: history.concat([{ squares, lastMove }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({ stepNumber: step, xIsNext: step % 2 === 0 });
    }

    reverseMoves() {
        this.setState({ movesReversed: !this.state.movesReversed });
    }

    newGame() {
        this.setState({
            history: [{ squares: Array(this.boardSize ** 2).fill(null), lastMove: null }],
            stepNumber: 0,
            xIsNext: true,
            movesReversed: false
        })
    }

    boardChange(event) {
        this.boardSize = parseInt(event.target.value);
        this.newGame();
    }

    render() {
        const history = this.state.history;
        const stepNumber = this.state.stepNumber;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares).winner;
        const winningLine = calculateWinner(current.squares).winningLine;
        const numberOfMoves = current.squares.reduce((x, y) => y != null ? x + 1 : x, 0);
        const boardIsFull = numberOfMoves === this.boardSize ** 2;

        // Here the lastMove is rendered into each button in the list.
        const moves = history.map((step, move) => {
            const desc = move ? 'Go to move #' + move + step.lastMove : 'Go to game start';
            // Here I added a check to see if the stepNumber matches the move and if so to 'bold' the text.
            return (
                <li key={move}>
                    <button
                        onClick={() => this.jumpTo(move)}
                        style={move === stepNumber ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}
                    >
                        {desc}
                    </button>
                </li>
            );
        });

        let status;
        if (winner)
            status = 'Winner: ' + winner;
        else if (boardIsFull)
            status = 'Result is drawn';
        else
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        size={this.boardSize}
                        winningLine={winningLine}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>Total moves: {numberOfMoves}</div>
                    <div>
                        <p><em>Moves list:</em></p>
                        <button onClick={() => this.reverseMoves()}>
                            {this.state.movesReversed ? 'Change To Ascending Order' : 'Change To Descending Order'}
                        </button>
                    </div>
                    <ol>{this.state.movesReversed ? moves.reverse() : moves}</ol>
                    <button onClick={() => this.newGame()}>New Game</button>
                    <p>Choose board size below.</p>
                    <p>(will result in a new game)</p>
                    <select onChange={event => this.boardChange(event)}>
                        <option value='3'>3 x 3</option>
                        <option value='4'>4 x 4</option>
                        <option value='5'>5 x 5</option>
                        <option value='6'>6 x 6</option>
                        <option value='7'>7 x 7</option>
                        <option value='8'>8 x 8</option>
                        <option value='9'>9 x 9</option>
                        <option value='10'>10 x 10</option>
                        <option value='20'>20 x 20</option>
                    </select>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const size = squares.length ** 0.5;

    // Here I build a two dimensional array of the board, called "board".
    const board = [];
    let counter = 0;
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row[j] = squares[counter];
            counter++;
        }
        board[i] = row;
    }

    // First I check for a winner in rows.
    for (let i = 0; i < size; i++) {
        let xCount = 0;
        let oCount = 0;
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 'X')
                xCount++;
            if (board[i][j] === 'O')
                oCount++;
        }
        if (xCount === size || oCount === size) {
            const winningLine = calculateWinningLine('row', size, i, xCount === size ? 'X' : 'O');
            return { winner: xCount === size ? 'X' : 'O', winningLine };
        }
    }

    // Now I check for a winner in columns.
    for (let i = 0; i < size; i++) {
        let xCount = 0;
        let oCount = 0;
        for (let j = 0; j < size; j++) {
            if (board[j][i] === 'X')
                xCount++;
            if (board[j][i] === 'O')
                oCount++;
        }
        if (xCount === size || oCount === size) {
            const winningLine = calculateWinningLine('column', size, i, xCount === size ? 'X' : 'O');
            return { winner: xCount === size ? 'X' : 'O', winningLine };
        }
    }

    // Now I check for the diagonal winner.
    let xCount = 0;
    let oCount = 0;
    for (let i = 0; i < size; i++) {
        if (board[i][i] === 'X')
            xCount++;
        if (board[i][i] === 'O')
            oCount++;
    }
    if (xCount === size || oCount === size) {
        const winningLine = calculateWinningLine('diagonal', size, null, xCount === size ? 'X' : 'O');
        return { winner: xCount === size ? 'X' : 'O', winningLine };
    }

    // Now I check for the reverse-diagonal winner.
    xCount = 0;
    oCount = 0;
    for (let i = 0; i < size; i++) {
        if (board[i][size - i - 1] === 'X')
            xCount++;
        if (board[i][size - i - 1] === 'O')
            oCount++;
    }
    if (xCount === size || oCount === size) {
        const winningLine = calculateWinningLine('reverse-diagonal', size, null, xCount === size ? 'X' : 'O');
        return { winner: xCount === size ? 'X' : 'O', winningLine };
    }
    return { winner: null, winningLine: [] };
}

function calculateWinningLine(type, size, index, winner) {
    const squares = Array(size ** 2).fill(null);
    if (type === 'row') {
        for (let i = index * size; i < index * size + size; i++) {
            squares[i] = winner;
        }
        return squares;
    }
    if (type === 'column') {
        for (let i = index; i < size ** 2; i += size) {
            squares[i] = winner;
        }
        return squares;
    }
    if (type === 'diagonal') {
        for (let i = 0; i < size ** 2; i += size + 1)
            squares[i] = winner;
        return squares;
    }
    // The only scenario left is the 'reverse-diagonal', which I address here.
    for (let i = size - 1; i < size ** 2 - 1; i += (size - 1))
        squares[i] = winner;
    return squares;
}

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
