// Fetch and display questions
function fetchQuestions() {
    fetch("/api/questions")
      .then((response) => response.json())
      .then((questions) => {
        const questionsList = document.getElementById("questionsList");
        questionsList.innerHTML = "";
        questions.forEach((q) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${q.question}</strong>
            <ul>
              ${q.answers.map((a) => `<li>${a}</li>`).join("")}
            </ul>
            <textarea placeholder="Your answer"></textarea>
            <button onclick="postAnswer(${q.id}, this.previousSibling.value)">Post Answer</button>
          `;
          questionsList.appendChild(li);
        });
      });
  }
  
  // Post a new question
  function postQuestion() {
    const questionInput = document.getElementById("questionInput");
    const question = questionInput.value;
    if (!question) return alert("Please enter a question!");
  
    fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }).then(() => {
      questionInput.value = "";
      fetchQuestions();
    });
  }
  
  // Post an answer
  function postAnswer(id, answer) {
    if (!answer) return alert("Please enter an answer!");
  
    fetch(`/api/answers/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    }).then(() => fetchQuestions());
  }
  
  // Ask the AI chatbot
  function askChatbot() {
    const chatbotInput = document.getElementById("chatbotInput");
    const question = chatbotInput.value;
    if (!question) return alert("Please enter a question!");
  
    fetch("/api/ai-chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })
      .then((response) => response.json())
      .then((data) => {
        const chatbotResponse = document.getElementById("chatbotResponse");
        chatbotResponse.textContent = `AI: ${data.answer}`;
      });
  }
  
  // Load questions on page load
  fetchQuestions();
  