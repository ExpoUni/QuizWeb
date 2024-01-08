let currentPlayer = {};
let currentQuestion = {};
let scores = {};
let totalQuestions = 0;
let correctAnswers = 0;
let timer;


function joinGame() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();

    if (!playerName) {
        return;
    }

    currentPlayer = {
        name: playerName,
        score: 0
    };

    document.getElementById('login-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    fetchQuestionFromAPI();
}

function fetchQuestionFromAPI() {
    const subjects = ['17', '19', '9', '20']; // Categories for science, maths, general knowledge, aptitude

    const mythologyIndex = subjects.indexOf('20');
    if (mythologyIndex !== -1) {
        subjects.splice(mythologyIndex, 1);
    }

    const selectedSubject = subjects[Math.floor(Math.random() * subjects.length)];

    fetch(`https://opentdb.com/api.php?amount=1&category=${selectedSubject}&difficulty=medium&type=multiple`)
        .then(response => response.json())
        .then(data => {
            currentQuestion = {
                question: data.results[0].question,
                correctAnswer: data.results[0].correct_answer,
                incorrectAnswers: data.results[0].incorrect_answers
            };
            startTimer(15);
            displayQuestion();
        })
        .catch(error => {
            console.error('Error fetching question:', error);
            handleGameOver();
        });
}

function displayQuestion() {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const scoreElement = document.getElementById('score');

    questionElement.innerHTML = currentQuestion.question;
    optionsElement.innerHTML = '';

    const allOptions = [currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers];
    allOptions.sort(() => Math.random() - 0.5);

    allOptions.forEach(option => {
        const li = document.createElement('li');
        li.textContent = option;
        li.addEventListener('click', () => checkAnswer(option));
        optionsElement.appendChild(li);
    });

    updateScoreboard();
    scoreElement.textContent = `Score: ${currentPlayer.score}`;
}

function checkAnswer(answer) {
    clearTimeout(timer); // Stop the timer when an answer is selected

    disableOptions(); // Disable clicking while processing answer

    if (answer === currentQuestion.correctAnswer) {
        markAnswer(findOptionByText(answer), 'green');
        currentPlayer.score += 10;
        correctAnswers++;
    } else {
        markAnswer(findOptionByText(answer), 'red');
        markAnswer(findOptionByText(currentQuestion.correctAnswer), 'green');
    }

    setTimeout(() => {
        resetOptions(); // Reset the options to their initial state
        if (totalQuestions < 5) {
            fetchQuestionFromAPI();
        } else {
            displayResult();
        }
    }, 2000);
}

function markAnswer(element, color) {
    element.style.backgroundColor = color;
}

function resetOptions() {
    const options = document.querySelectorAll('#options li');
    options.forEach(option => {
        option.style.backgroundColor = ''; // Reset background color
        option.style.pointerEvents = 'auto'; // Re-enable clicking
    });
}

function disableOptions() {
    const options = document.querySelectorAll('#options li');
    options.forEach(option => {
        option.style.pointerEvents = 'none'; // Disable clicking while processing answer
    });
}

function updateScoreboard() {
    scores[currentPlayer.name] = currentPlayer.score;
    const scoresElement = document.getElementById('scores');
    scoresElement.innerHTML = '';

    Object.keys(scores)
        .sort((a, b) => scores[b] - scores[a])
        .forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player}: ${scores[player]} points`;
            scoresElement.appendChild(li);
        });
}

function handleGameOver() {
    showFeedback('No more questions. Game Over!', 'black');
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function showFeedback(message, color) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = message;
    feedbackElement.style.color = color;
}

function findOptionByText(text) {
    const options = document.querySelectorAll('#options li');
    return Array.from(options).find(option => option.textContent === text);
}

function displayResult() {
    clearTimeout(timer); // Clear any existing timer

    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'block';

    const resultMessage = document.getElementById('result-message');
    const percentage = (correctAnswers / totalQuestions) * 100;

    if (percentage < 75) {
        resultMessage.textContent = `Good effort, ${currentPlayer.name}! You scored ${currentPlayer.score} points (${percentage}%). Keep practicing!`;
    } else if (percentage >= 90) {
        resultMessage.textContent = `Congratulations, ${currentPlayer.name}! You are a quiz master! You scored ${currentPlayer.score} points (${percentage}%). Well done!`;
    } else {
        resultMessage.textContent = `Great job, ${currentPlayer.name}! You scored ${currentPlayer.score} points (${percentage}%). Keep it up!`;
    }
}

function startTimer(seconds) {
    let time = seconds;
    timer = setInterval(() => {
        document.getElementById('timer').textContent = time;
        time--;

        if (time < 0) {
            clearTimeout(timer); // Stop the timer
            checkAnswerTimeout();
        }
    }, 1000);
}

function checkAnswerTimeout() {
    disableOptions(); // Disable clicking while processing answer

    markAnswer(findOptionByText(currentQuestion.correctAnswer), 'green');

    setTimeout(() => {
        resetOptions(); // Reset the options to their initial state
        if (totalQuestions < 5) {
            fetchQuestionFromAPI();
        } else {
            displayResult();
        }
    }, 2000);
}



window.onload = function () {
    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', joinGame);


};
