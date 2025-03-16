const Joi = require("joi");

const validateCreatePost = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    content: Joi.string().min(1).max(5000).required(),
    mediaIds: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};

module.exports = validateCreatePost;
