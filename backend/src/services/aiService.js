import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',

  apiKey: process.env.OPENROUTER_API_KEY,
})

//recommendation engine

export const getRecommendations = async ({
  viewedProducts,
  orderCategories,
  catalogueSample,
}) => {
  try {
    const prompt = `
You are a product recommendation engine for a hyperlocal e-commerce platform.

The buyer has recently viewed:
${JSON.stringify(viewedProducts)}

Past order categories:
${JSON.stringify(orderCategories)}

Available products:
${JSON.stringify(catalogueSample)}

Return ONLY valid JSON array of 5 objects:
[
  {
    "productId": "...",
    "reason": "..."
  }
]
`

    const completion = await client.chat.completions.create({
      //this is best for now, maybe switch to be a better model or some other paid service for deployment
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return JSON.parse(
      completion.choices[0].message.content
    )
  } catch (error) {
    console.error('AI Recommendation Error:', error)

    return []
  }
}

//search expansion

export const expandSearchQuery = async (query) => {
  try {
    const prompt = `
The user searched for:
"${query}"

Return ONLY a JSON array of related search terms.
`

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return JSON.parse(
      completion.choices[0].message.content
    )
  } catch (error) {
    console.error('AI Search Error:', error)

    return [query]
  }
}

//price suggestion

export const suggestProductPrice = async ({
  productName,
  category,
  similarProducts,
}) => {
  try {
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
`

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return JSON.parse(
      completion.choices[0].message.content
    )
  } catch (error) {
    console.error('AI Price Suggestion Error:', error)

    return null
  }
}