import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    size = 3; // New field to hold the size of the board.

    renderSquare(i) {
        return <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)}/>;
    }

    renderRow(index) {
        let output = null;
        for (let i = index; i < index + this.size; i++)
            output = <>{output}{this.renderSquare(i)}</>;
        return output;
    }

    render() {
        let output = null;
        for (let i = 0; i < this.size; i++) {
            const row = <div className="board-row">{this.renderRow(i * this.size)}</div>;
            output = <>{output}{row}</>;
        }
        return <div>{output}</div>;
    }
}

class Game extends React.Component {
    // I added a new field to history called "lastMove" which remembers each move.
    state = {
        history: [{ squares: Array(9).fill(null), lastMove: null }],
        stepNumber: 0,
        xIsNext: true
    };

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i])
            return;
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        // Here I convert the square number to row/col format and update history with it.
        const lastMove = ' (row: ' + (Math.floor(i / 3) + 1) + ' col: ' + ((i % 3) + 1) + ')';
        this.setState({
            history: history.concat([{ squares, lastMove }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({ stepNumber: step, xIsNext: step % 2 === 0 });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        // Here the lastMove is rendered into each button in the list.
        const moves = history.map((step, move) => {
            const desc = move ? 'Go to move #' + move + step.lastMove : 'Go to game start';
            // Here I added a check to see if the stepNumber matches the move and if so to 'bold' the text.
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}
                            style={move === this.state.stepNumber ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}>
                        {desc}
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
