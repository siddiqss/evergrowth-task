/* AWS Lambda Handler function

 Author: Talha Siddique
 Contact: tstalhasiddique@gmail.com

*/

let tshirtsFetched = {};
let totalNumberOfProducts = 0;

function searchForTShirts(text) {
  const tshirtRegex = /\bt(?:shirt)?\s*(?:shirt)?|t(?:op|ops)/gi;
  return tshirtRegex.test(text);
}

async function getProducts(url, pageNumber = 1) {
  try {
    const response = await fetch(
      url + `/products.json?limit=250&page=${pageNumber}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    totalNumberOfProducts += data.products.length;
    console.log("Number of products: ", totalNumberOfProducts);

    const tshirts = data.products.filter((product) =>
      searchForTShirts(product.product_type)
    );

    tshirts.forEach((product) => {
      if (product.variants) {
        const productPrices = product.variants
          .filter((variant) => variant.price)
          .map((variant) => variant.price);
        tshirtsFetched[product.title] = productPrices;
      }
    });

    if (data.products.length === 250) {
      await getProducts(url, pageNumber + 1);
    }

    return tshirtsFetched;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

function findMinMaxPrices(priceData) {
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const [productTitle, prices] of Object.entries(priceData)) {
    const numericPrices = prices.map((price) => parseFloat(price));

    const productMin = Math.min(...numericPrices);
    const productMax = Math.max(...numericPrices);

    minPrice = Math.min(minPrice, productMin);
    maxPrice = Math.max(maxPrice, productMax);
  }

  return {
    lowestPrice: minPrice,
    highestPrice: maxPrice,
  };
}

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    // Extract URL from event
    const url = event.url;
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required field: URL" }),
      };
    }

    const tshirtsData = await getProducts(url);

    if (!tshirtsData) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to retrieve product data" }),
      };
    }

    const { lowestPrice, highestPrice } = findMinMaxPrices(tshirtsData);
    console.log("Lowest price: ", lowestPrice);
    console.log("Highest price: ", highestPrice);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        url,
        minimum_tshirt_price: lowestPrice,
        maximum_tshirt_price: highestPrice,
        currency: "USD",
      }),
    };

    return response;
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
