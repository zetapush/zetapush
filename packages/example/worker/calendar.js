class Calendar {
  getNow() {
    return (new Date()).toLocaleDateString();
  }
}

module.exports = { Calendar };
