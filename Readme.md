## Evergrowth Assignment for Backend Engineer Position

### Problem

Build an API which should accept Shopify store URL as input and return the prices of the least and most expensive t-shirts offered by the store.

## Tech Stack

- Node.js
- AWS API Gatway
- AWS Lambda

## How to use?

POST request to endpoint: https://klm81slwa4.execute-api.us-east-1.amazonaws.com/dev/prices

Insert "url" in the body:
{
    "url": "https://thatshirtwascash.com"
}

The response from the API looks like this:
{
    "statusCode": 200,
    "body": "{\"url\":\"https://thatshirtwascash.com\",\"minimum_tshirt_price\":18.95,\"maximum_tshirt_price\":98.95,\"currency\":\"USD\"}"
}

## Explanation
Used AWS API Gateway to create a resource with /prices endpoint which acts as POST method.
Integrated AWS Lambda with API Gateway endpoint so the data sent to the API endpoint is sent as event in the lambda handler. 

The lambda handler make a call to products.json endpoint of the shopify website.
The call returns with maximum 250 products. I have passed page paramter to the getProducts function which recursively calls the products.json endpoint with new page number and fetches more products (kinda pagination). getProducts function returns an Object with product title as key and prices of product variants in the form of array as values of the Object.

Structure of returned Object.
{
"xyz product": [12.99, 10.99, 13.99, 19.99]
}

It filters the fetched products with `product_type` parameter present in the product body. If the product type is "t-shirt" or "top", it's added to an Object (tshirtsFetched).

findMinMaxPrices function takes the Object returned by getProducts function and finds the min and max price.

### Timeout

The code takes a few seconds to execute compeletely. It depends on the number of products/pages the site has. The more pages a site has, the more time it takes to send requests and fetch response. The default lambda function timeout is 3 seconds. For this task, I have increased the lambda timeout to 60 seconds.

### Limitations

The products.json does not specify the price currency. It automatically converts the prices to local currency from where the request is being sent to the website. In our case, the request will be sent from the lambda function in us-east-1 region so the prices should ideally be in USD.


### To Note:
Make sure to not use huge sites since lambda function has a timeout of 60 seconds. 

### Contact
Talha Siddique (tstalhasiddique@gmail.com)