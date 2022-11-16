import { Response } from 'express';
// rewrite using middleware
// add error handlers for xase like "No albums found", "No selfie found", "No photos found" ect.

class ApiError extends Error {
  constructor(message:string) {
    super();
    this.message = message;
  }

  // статические фун-ии это фун-ии, которые можна вызывать без создания обьекта
  // тоесть можем обращатся к класу и вызывать фун-ию

  static badRequest(res:Response, message:string):void {
    res.status(404).send({ errors: [{ msg: message }] });
  }

  static internal(res:Response, message:string) {
    res.status(500).send({ errors: [{ msg: message }] });
  }

  static forbidden(res:Response, message:string) {
    res.status(403).send({ errors: [{ msg: message }] });
  }
}

export default ApiError;
