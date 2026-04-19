export default async function handler(req, res) {
  try {
    // Fetch GOLD
    const goldResponse = await fetch("https://www.goldapi.io/api/XAU/PKR", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY
      }
    });

    const goldData = await goldResponse.json();

    // Fetch SILVER
    const silverResponse = await fetch("https://www.goldapi.io/api/XAG/PKR", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY
      }
    });

    const silverData = await silverResponse.json();

    res.setHeader("Cache-Control", "s-maxage=86400"); // 1 day cache for Zakat Mate

    res.status(200).json({
      gold_per_gram: goldData.price_gram_24k,
      silver_per_gram: silverData.price_gram_999,
      currency: "PKR",
      source: "goldapi.io",
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rates" });
  }
}
