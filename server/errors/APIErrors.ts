class ApiError extends Error {
  status: number;

  constructor(status:number, message:string) {
    super();
    this.status = status;
    this.message = message;
  }

  // статические фун-ии это фун-ии, которые можна вызывать без создания обьекта
  // тоесть можем обращатся к класу и вызывать фун-ию

  static badRequest(message:string) {
    return new ApiError(404, `${message}`);
  }

  static internal(message:string) {
    return new ApiError(500, `${message}`);
  }

  static forbidden(message:string) {
    return new ApiError(403, `${message}`);
  }
}

export default ApiError;
