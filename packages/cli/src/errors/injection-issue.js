const { ErrorAnalyzer } = require('./troubleshooting');

class InjectionIssueAnalyzer extends ErrorAnalyzer {
  isAnInjectionCustomServiceError(err) {
    if (!err.message) {
      return { isError: false };
    }
    const parseMessage = err.message.split('.')[0];

    if (parseMessage.includes('Cannot resolve all parameters for')) {
      return {
        isError: true,
        class: parseMessage.split("'")[1],
      };
    } else {
      return {
        isError: false,
        class: null,
      };
    }
  }

  isErrorInConstructorCustomService(err) {
    if (err.message && err.message.includes('Error during instantiation')) {
      return true;
    } else {
      return false;
    }
  }

  async getError(err) {
    // INJECTION-01
    const checkInjectionCustomService = this.isAnInjectionCustomServiceError(
      err,
    );
    if (checkInjectionCustomService.isError) {
      return { code: 'INJECTION-01' };
    }

    // SERVICE-04
    const checkConstructorError = this.isErrorInConstructorCustomService(err);
    if (checkConstructorError) {
      return { code: 'SERVICE-04' };
    }

    return null;
  }
}

module.exports = { InjectionIssueAnalyzer };
