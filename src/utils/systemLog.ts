const systemError = (message: any) => {
  console.log(message);
};

const systemInfo = (message: any, data: any) => {
  console.log(message, data);
};

const systemWarning = (message: any) => {};

export default { systemError, systemInfo, systemWarning };
