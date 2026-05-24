import OpenAI from 'openai';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',

  apiKey: process.env.OPENROUTER_API_KEY,
});

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
      .sort({ rating: -1 })
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

    const completion = await client.chat.completions.create({
      //this is best for now, maybe switch to be a better model or some other paid service for deployment
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content);
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

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content);
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
      .sort({ rating: -1 })
      .limit(20)
      .select('_id name price')
      .lean();

    const prompt = `
Product:
"${productName}"

Category:
"${category}"

Similar products:
${JSON.stringify(similarProducts)}

Return ONLY:
{
  "min": number,
  "max": number,
  "recommended": number,
  "reason": "..."
}
`;

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('AI Price Suggestion Error:', error);

    return null;
  }
};