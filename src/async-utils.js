export class OperationTimeoutError extends Error {
  constructor(message = "La operacion tardo demasiado.") {
    super(message);
    this.name = "OperationTimeoutError";
    this.code = "OPERATION_TIMEOUT";
  }
}

export function withTimeout(operation, timeoutMs = 15000, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new OperationTimeoutError(message)), timeoutMs);
  });

  return Promise.race([Promise.resolve(operation), timeout])
    .finally(() => clearTimeout(timeoutId));
}
