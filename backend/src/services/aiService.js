import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

let client = null;
const getClient = () => {
    if (!client) {
        client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return client;
};

//recommendation engine 

export const getRecommendations = async ({
  viewedProducts,
  userId
}) => {
  try {
    const pastOrders = await Order.find({ buyer: userId })
      .limit(10)
      .select('items.category')
      .lean();

    // map i to i.category, then as all i belongs to an order, map that array of i to its order
    // then map that array of array of categories to a flatMap, then a set
    const orderCategories = [...new Set(pastOrders.flatMap(o => o.items.map(i => i.category)))];

    const catalogueSample = await Product.find({
      isActive: true,
      ...(orderCategories.length > 0 && { category: { $in: orderCategories } })
    })
      .sort({ averageRating: -1 })
      .limit(50)
      .select('_id name category price rating')
      .lean();

    const prompt = `
You are a recommendation engine for a hyperlocal multi-vendor ecommerce platform.

The buyer recently viewed:
${JSON.stringify(viewedProducts)}

The buyer previously ordered from these categories:
${JSON.stringify(orderCategories)}

Available products:
${JSON.stringify(catalogueSample)}

Recommend EXACTLY 5 relevant products.

Prioritize:
- similar categories
- complementary products
- nearby/hyperlocal relevance if possible
- products matching browsing intent

Return ONLY valid JSON.

Format:
[
  {
    "productId": "string",
    "reason": "short sentence"
  }
]

No markdown.
No explanation.
No extra text.
`;

    const completion = await getClient().chat.completions.create({
      //this is best for now, maybe switch to be a better model or some other paid service for deployment
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0].message.content.trim();

    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (error) {
    console.error('AI Recommendation Error:', error);

    return [];
  }
};

//search expansion

export const expandSearchQuery = async (query) => {
  try {
    const prompt = `
The user searched for:
"${query}"

Return ONLY a valid JSON array containing 6 to 8 ecommerce product search terms.

Rules:
- Include synonyms
- Include common marketplace names
- Include informal names buyers may use
- Keep terms short
- Include the original query
- No explanations
- No markdown
- JSON array only

Example:
Input: "laptop bag"

Output:
[
  "laptop bag",
  "notebook bag",
  "laptop backpack",
  "computer bag",
  "laptop sleeve",
  "laptop carry case",
  "laptop tote",
  "laptop briefcase"
]
`;

    const completion = await getClient().chat.completions.create({
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    const raw = completion.choices[0].message.content.trim();

    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return [...new Set(parsed)];
  } catch (error) {
    console.error('AI Search Error:', error);

    return [query];
  }
};

//price suggestion

export const suggestProductPrice = async ({
  productName,
  category
}) => {


  try {

    const similarProducts = await Product.find({
      isActive: true,
      category: category
    })
      .sort({ averageRating: -1 })
      .limit(20)
      .select('_id name price')
      .lean();

    const prompt = `
You are an AI pricing assistant for a hyperlocal multi-vendor ecommerce marketplace in India.

The seller wants to list this product:

Product Name:
"${productName}"

Category:
"${category}"

Similar products already on the platform:
${JSON.stringify(similarProducts)}

Your task:
- Analyze comparable products
- Estimate a realistic market price range in INR
- Avoid extreme or unrealistic values
- Base pricing mainly on the provided similar products
- Consider typical ecommerce buyer expectations
- Recommend a competitive but profitable selling price

Return ONLY valid JSON.

Format:
{
  "min": number,
  "max": number,
  "recommended": number,
  "reason": "short explanation"
}

Rules:
- recommended must be between min and max
- min must be less than max
- Prices must be realistic Indian Rupee values
- reason must be one short sentence
- No markdown
- No explanation outside JSON
`;

    const completion = await getClient().chat.completions.create({
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0].message.content.trim();

    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (error) {
    console.error('AI Price Suggestion Error:', error);

    return null;
  }
};