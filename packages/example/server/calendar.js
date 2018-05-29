class Calendar {
  getNow() {
    // return (new Date()).toLocaleTimeString();
    // return (new Date()).toLocaleString();
    return (new Date()).toLocaleDateString();
  }
}

module.exports = { Calendar };
