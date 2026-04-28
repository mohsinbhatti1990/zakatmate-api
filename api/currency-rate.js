import config from '../config/config.json' assert { type: 'json' };

export default async function handler(req, res) {
  try {
    const url = `${config.exchangeRateApi.baseUrl}/${process.env.API_KEY}${config.exchangeRateApi.endpoint}/${config.exchangeRateApi.baseCurrency}`;

    const response = await fetch(url);
    const data = await response.json();

    if (
      data[config.exchangeRateApi.responseMapping.successKey] !==
      config.exchangeRateApi.responseMapping.successValue
    ) {
      throw new Error("API failed");
    }

    const rates =
      data[config.exchangeRateApi.responseMapping.ratesKey];

    const result = {};

    Object.keys(config.supportedCurrencies).forEach((code) => {
      result[code] = {
        rate: code === "USD" ? 1 : rates[code],
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
      error: "Failed to fetch exchange rates"
    });
  }
}
