export const evaluate = (message: string, error: any) => {
  return message.replace(/\$\{([^\\?}]+)[\\]?\}/g, (_, variable) => {
    let value = error;
    const parts = variable.split('.');
    for (let part of parts) {
      value = value[part];
      if (!value) {
        break;
      }
    }
    return value;
  });
};
