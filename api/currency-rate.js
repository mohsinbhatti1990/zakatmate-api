import config from '../config/currency-config.json' assert { type: 'json' };

export default async function handler(req, res) {
  try {
    const url = `${config.exchangeRateApi.baseUrl}/${process.env.API_KEY}${config.exchangeRateApi.endpoint}/${config.exchangeRateApi.baseCurrency}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.defaults.timeoutMs || 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const data = await response.json();

    if (
      data[config.exchangeRateApi.responseMapping.successKey] !==
      config.exchangeRateApi.responseMapping.successValue
    ) {
      throw new Error("API failed");
    }

    const rates = data[config.exchangeRateApi.responseMapping.ratesKey];

    if (!rates) {
      throw new Error("Rates not found in API response");
    }

    const result = {};

    Object.keys(config.supportedCurrencies).forEach((code) => {
      result[code] = {
        rate: code === "USD"
          ? 1
          : rates[code] ?? (code === "PKR" ? config.defaults.fallbackUsdToPkr : null),
        name: config.supportedCurrencies[code].name,
        symbol: config.supportedCurrencies[code].symbol
      };
    });

    res.setHeader('Cache-Control', 's-maxage=86400');

    res.status(200).json({
      base: config.exchangeRateApi.baseCurrency,
      lastUpdated: new Date().toISOString(),
      rates: result
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch exchange rates",
      message: error.message
    });
  }
}
