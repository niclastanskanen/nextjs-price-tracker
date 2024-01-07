import axios from 'axios';
import * as cheerio from 'cheerio';

import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    // Fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    // Extract the product title
    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
    )

    // Extract the original price
    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      // $('.a-size-base.a-color-price')
    )

    // Extract the availability and stock
    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    // Extract the images
    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') ||
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}'

    // Convert the images to an array
    const imagesUrls = Object.keys(JSON.parse(images))

    // Extract the currency
    const currency = extractCurrency($('.a-price-symbol'))
    
    // Extract the discount rate
    const discountRate = $('.savingsPercentage').text().replace(/&nbsp;|\s|[-%]/g, '');

    // Extract the description
    const description = extractDescription($);

    // Extract the category

    // Extract the reviews count text
    const reviewsText = $('#acrCustomerReviewText').text().trim();

    // Use a regular expression to find the first match of one or more digits, possibly separated by non-breaking spaces
    const match = reviewsText.match(/\d+(\s*\d+)*/);
    const reviewsNumberString = match ? match[0].replace(/\s+/g, '') : '0';

    // Convert the extracted string to a number
    const reviewsCount = Number(reviewsNumberString);

    // Extract the stars from within the 'averageCustomerReviews' div
    const starsText = $('#averageCustomerReviews .a-size-base.a-color-base').first().text().trim();

    // Replace the comma with a dot and convert to a number
    const stars = Number(starsText.replace(',', '.'));

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imagesUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount: reviewsCount,
      stars: stars,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }

    console.log(data);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`)
  }
}