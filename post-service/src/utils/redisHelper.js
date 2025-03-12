// invalidate caches
const invalidateGetPosts = async (req, input) => {
  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
};

module.exports = { invalidateGetPosts };
