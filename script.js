const API_URL = "https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple"


const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: .94,
    startVelocity: 30,
  };

const questionContainer = document.getElementById('question-container');
const submitButton = document.getElementById('submit-button');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const answerContainer = document.getElementById('answer-container');
const nextButton = document.getElementById('next-button');
const playagainButton = document.getElementById('playagain-button');
const progressBar = document.getElementById('progress-bar');

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswerSubmitted = false;

async function fetchQuizData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        quizData = data.results.map(item => ({
            question: decodeHtml(item.question),
            options: [...item.incorrect_answers.map(decodeHtml), decodeHtml(item.correct_answer)].sort(() => Math.random() - 0.5),
            answer: decodeHtml(item.correct_answer)
        }));
        loadQuestion();
    } catch (error) {
        console.error("Error fetching quiz data:", error);
    }
}

function loadQuestion(){
    const currentQuestion = quizData[currentQuestionIndex];
    questionContainer.innerHTML = `
        <h2>${currentQuestion.question}</h2>`;
    answerContainer.innerHTML=`
        
        <ul>
        ${currentQuestion.options.map(option => `
            <li class="answer-box">
                <input type="radio" name="answer" value="${option}" id="${option}">
                <label for="${option}">${option}</label>
            </li>`).join('')}
        </ul>
    `;

       // Add event listeners to all answer-box elements
       document.querySelectorAll('.answer-box').forEach(box => {
        box.addEventListener('click', function() {
            // Remove the 'selected' class from all boxes
            document.querySelectorAll('.answer-box').forEach(b => b.classList.remove('selected'));
            
            // Add the 'selected' class to the clicked box
            this.classList.add('selected');

            // Also check the corresponding radio button
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
    
    
}

function decodeHtml(html) {
    const text = document.createElement('textarea');
    text.innerHTML = html;
    return text.value;
}
function checkAnswer(){
    updateProgressBar();
    const selectedOption=document.querySelector(`input[name="answer"]:checked`);
    if(!selectedOption)
    {
        alert("Please select an option");
        return;
    }
    const selectedAnswer = decodeHtml(selectedOption.value).trim();
    const correctAnswer = decodeHtml(quizData[currentQuestionIndex].answer).trim();
    if (selectedAnswer === correctAnswer) {
        shoot();
        feedback.innerHTML = '<span class="feedback-icon">✔</span> Correct!';
        feedback.className = 'correct-feedback';
        score++;
    } else {
        feedback.className = 'incorrect-feedback';
        feedback.innerHTML = `<span class="feedback-icon">✘</span> Incorrect! The correct answer is ${correctAnswer}`;
    }


    submitButton.style.display = 'none';
    nextButton.style.display= 'block';
    isAnswerSubmitted=true;


}
function showFinalScore(){
    questionContainer.innerHTML='';
    answerContainer.innerHTML='';
    submitButton.style.display='none';
    feedback.textContent='';
    feedback.className = '';
    nextButton.style.display='none';

    playagainButton.style.display='block';
    shoot();
    /*scoreDisplay.textContent = `Your final score is: ${score}/${quizData.length}`;*/

      // Animated score
      let currentScore = 0;
      const finalScore = score;
      const scoreInterval = setInterval(() => {
          if (currentScore < finalScore) {
              currentScore++;
              scoreDisplay.textContent = `Your final score is: ${currentScore}/${quizData.length}`;
          } else {
              clearInterval(scoreInterval);
          }
      }, 200);

      if (finalScore === 0) {
        scoreDisplay.textContent = `Your final score is: ${finalScore}/${quizData.length}`;
    }
    
    
}

function handleNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
        feedback.textContent = '';
        feedback.className = '';
        submitButton.style.display = 'block'; // Show the submit button for the new question
        nextButton.style.display = 'none'; // Hide the next button

        isAnswerSubmitted = false;
    } else {
        showFinalScore();
    }
}

function newGame() {
    score = 0;
    currentQuestionIndex = 0;
    isAnswerSubmitted = false;
    feedback.textContent = '';
    feedback.className = '';
    playagainButton.style.display = 'none';
    fetchQuizData(); // Fetch new questions and start the game
    scoreDisplay.textContent = '';
    submitButton.style.display='block';
    resetProgressBar();

}
nextButton.addEventListener('click', handleNext);
submitButton.addEventListener('click', checkAnswer);
playagainButton.addEventListener('click', newGame);
fetchQuizData();
loadQuestion();

function shoot() {
    confetti({
      ...defaults,
      particleCount: 30,
      scalar: 1.2,
      shapes: ["circle", "square"],
      colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
    });
  
    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 2,
      shapes: ["emoji"],
      shapeOptions: {
        emoji: {
          value: ["🦄", "🌈", "⭐", "🎉"],
        },
      },
    });
  }
  function updateProgressBar() {
    const progress = ((currentQuestionIndex+1) / quizData.length) * 100;
    progressBar.style.width = progress + '%';
}
function resetProgressBar() {
    progressBar.style.width = '0%'; // Clear the progress bar
}
  
