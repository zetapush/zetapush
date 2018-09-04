client = new ZetaPushClient.SmartClient({});
api = client.createProxyTaskService();

const messageNode = document.getElementById('message');
const messageTitle = document.getElementById('message-title');
const messageBody = document.getElementById('message-body');
let currentPage;

function goTo(page) {
  window.location.hash = page;
  document.body.classList.remove(`${currentPage}-active`);
  document.body.classList.add(`${page}-active`);
  currentPage = page;
}

function displayMessage(title, body, type) {
  messageNode.classList.remove('hidden');
  messageNode.classList.add(type || 'is-dark');
  messageTitle.innerHTML = title;
  messageBody.innerHTML = body;
  setTimeout(() => {
    messageNode.classList.add('hidden');
    messageNode.classList.remove(type || 'is-dark');
  }, 3000);
}

window.onload = function() {
  const page = window.location.hash;
  if (page) {
    goTo(page.substr(1));
  } else {
    goTo('home');
  }
};
