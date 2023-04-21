import Joi from "joi";

export const transactionsSchema = Joi.object({
  description: Joi.string().required(),
  value: Joi.number().required(),
  type: Joi.string().valid("withdraw", "deposit").required(),
});
