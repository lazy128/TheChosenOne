import { BadRequestException } from "../helpers/exception.helper.js";

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errorMessages = error.errors.map(err => `${err.path.join(".")}: ${err.message}`).join(", ");
    next(new BadRequestException(errorMessages));
  }
};
