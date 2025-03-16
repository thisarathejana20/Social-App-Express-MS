const Search = require("../models/Search");
const logger = require("../utils/logger");

const searchPost = async (req, res) => {
  logger.info("Search post route called");
  try {
    const { query } = req.query;

    const results = await Search.find(
      // mongoDB feature $text will match any text related content in indexed fields
      { $text: { $search: query } },
      // score will assign numeric values to matching content
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    res.json({ success: true, results });
  } catch (err) {
    logger.error("Error searching post", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { searchPost };
