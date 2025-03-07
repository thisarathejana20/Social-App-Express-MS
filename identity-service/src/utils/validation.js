const Joi = require("joi");

const validatingUserRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
  });

  return schema.validate(data);
};

module.exports = validatingUserRegistration;
