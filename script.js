/* ====================  flashcard script  ===================== */

/* ---- CONFIG ----------------------------------------------------
   Adjust these if you want different behaviour.
--------------------------------------------------------------- */
const QUESTIONS_URL = 'questions.json';   // path to your JSON file
// ----------------------------------------------------------------

let questions   = [];      // holds all loaded question objects
let currentIdx  = -1;      // index of the currently displayed question
let answered    = false;   // true after a choice has been made
let correctAns  = null;     // the right answer for the current card

/* -----------------------------------------------------------------
   Load questions once the page is ready.
----------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    fetch(QUESTIONS_URL)
        .then(r => r.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('JSON must contain an array of question objects');
            }
            questions = shuffleArray(data);
            showNext();
        })
        .catch(err => alert(`Error loading questions: ${err}`));
});

/* -----------------------------------------------------------------
   "Next" button click → show next card.
----------------------------------------------------------------- */
document.getElementById('nextBtn').addEventListener('click', showNext);

/* ====================  CORE FUNCTIONS  ========================= */

/**
 * Show the next question. When we run out of cards, reshuffle and start over.
 */
function showNext() {
    answered = false;
    correctAns = null;            // reset for new card
    document.getElementById('nextBtn').disabled = true;

    currentIdx++;
    if (currentIdx >= questions.length) {   // end of deck
        currentIdx = 0;
        questions = shuffleArray(questions);
    }

    const q = questions[currentIdx];
    renderCard(q);
}

/**
 * Build the card DOM for a given question object.
 */
function renderCard(q) {
    const container = document.getElementById('flashcard');
    container.innerHTML = '';                // clear any previous card

    const inner = document.createElement('div');
    inner.className = 'card-inner';
    container.appendChild(inner);

    /* ----- Front side – question + options ----- */
    const front = document.createElement('div');
    front.className = 'card-front';
    inner.appendChild(front);

    const h2 = document.createElement('h2');
    h2.textContent = q.question;
    h2.className = 'question';
    front.appendChild(h2);

    const ul = document.createElement('ul');
    ul.className = 'options';

    // Shuffle options so the correct one isn’t always #1
    const opts = shuffleArray([...q.options]);

    opts.forEach(opt => {
        const li  = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.className = 'optionBtn';
        btn.onclick   = () => answerChoice(btn, q.correctAnswer === opt);
        li.appendChild(btn);
        ul.appendChild(li);
    });

    front.appendChild(ul);

    /* ----- Back side – explanation ----- */
    const back = document.createElement('div');
    back.className = 'card-back';
    inner.appendChild(back);

    // Placeholder text; will be updated after answering
    const msg  = document.createElement('p');
    msg.id     = 'resultMsg';
    back.appendChild(msg);

    const exp = document.createElement('p');
    exp.textContent = q.explanation || '';
    back.appendChild(exp);
}

/**
 * Handle a user's choice.
 */
function answerChoice(btn, isCorrect) {
    if (answered) return;          // ignore clicks after the first one
    answered = true;
    correctAns = btn.textContent;

    document.getElementById('nextBtn').disabled = false;

    // Flip the card to show explanation
    const inner = btn.closest('.card-inner');
    inner.classList.add('card-flipped');

    // Colour the chosen button green/red
    btn.className += isCorrect ? ' correct' : ' incorrect';

    /* Update the message on the back side */
    const msg = document.getElementById('resultMsg');
    msg.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Wrong!'}</strong>`;
}

/**
 * Utility: return a shuffled copy of an array.
 */
function shuffleArray(arr) {
    const a = arr.slice();           // clone so we don’t mutate the original
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
