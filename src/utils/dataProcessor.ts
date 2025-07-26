import { ProductData } from "@/pages/Index";

// Groups reviews by product (by ID or title)
export const groupReviewsByProduct = (reviews: any[]) => {
  const productGroups: { [key: string]: any[] } = {};

  reviews.forEach(review => {
    const productKey = review.product_id || review.product_title || "Unknown Product";
    const productName = review.product_title || review.product_id || "Unknown Product";

    if (!productGroups[productKey]) {
      productGroups[productKey] = [];
    }

    productGroups[productKey].push({
      ...review,
      productName
    });
  });

  return productGroups;
};

// Parses API response into ProductData shape
export const parseAIResponse = (
  aiResponse: string,
  reviews: any[],
  productName: string
): ProductData => {
  let parsed: any;

  try {
    parsed = typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;

    // If parsed is not an object or missing required keys, treat it as invalid
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Parsed response is not a valid object");
    }
  } catch (e) {
    console.warn("❌ Invalid or malformed AI response for:", productName, aiResponse);
    throw new Error("Invalid AI response format");
  }

  return {
    productName,
    category: parsed.category || inferCategory(productName, reviews),
    features: parsed.features || extractBasicFeatures(reviews),
    summary: {
      mostAppreciated: parsed.mostAppreciated || generateMostAppreciated(reviews, parsed.category),
      leastAppreciated: parsed.leastAppreciated || generateLeastAppreciated(reviews, parsed.category),
      overallSentiment: parsed.overallSentiment || calculateOverallSentiment(reviews)
    },
    reviewCount: reviews.length
  };
};

// Fallback if API fails
export const createFallbackAnalysis = (
  reviews: any[],
  productName: string
): ProductData => {
  const category = inferCategory(productName, reviews);

  return {
    productName,
    category,
    features: extractBasicFeatures(reviews),
    summary: {
      mostAppreciated: generateMostAppreciated(reviews, category),
      leastAppreciated: generateLeastAppreciated(reviews, category),
      overallSentiment: calculateOverallSentiment(reviews)
    },
    reviewCount: reviews.length
  };
};

// Basic heuristics if sentiment not provided
export const calculateOverallSentiment = (
  reviews: any[]
): "positive" | "neutral" | "negative" => {
  if (reviews.length === 0) return "neutral";

  const sentiments = reviews
    .map(r => r.sentiment?.toLowerCase())
    .filter(s => s && ["positive", "neutral", "negative"].includes(s));

  if (sentiments.length > 0) {
    const pos = sentiments.filter(s => s === "positive").length;
    const neg = sentiments.filter(s => s === "negative").length;
    if (pos > neg) return "positive";
    if (neg > pos) return "negative";
    return "neutral";
  }

  const ratings = reviews
    .map(r => parseFloat(r.rating))
    .filter(r => !isNaN(r));

  if (ratings.length > 0) {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    if (avg >= 4) return "positive";
    if (avg <= 2) return "negative";
    return "neutral";
  }

  return "neutral";
};

// Guess category by product name + review text
export const inferCategory = (productName: string, reviews: any[]): string => {
  const name = productName.toLowerCase();
  const text = reviews.map(r => r.review_text || "").join(" ").toLowerCase();

  if (name.includes("phone") || text.includes("battery")) return "Electronics - Phone";
  if (name.includes("laptop") || text.includes("screen")) return "Electronics - Laptop";
  if (name.includes("shirt") || text.includes("fabric")) return "Clothing";
  if (name.includes("chair") || text.includes("assembly")) return "Furniture";
  if (name.includes("book") || text.includes("story")) return "Books";
  return "General Product";
};

// Approximate fallback features
export const extractBasicFeatures = (reviews: any[]) => {
  return {
    Quality: {
      positive: ["Good quality"],
      negative: ["Poor quality"],
      mentions: Math.floor(reviews.length * 0.4)
    },
    Value: {
      positive: ["Great value"],
      negative: ["Overpriced"],
      mentions: Math.floor(reviews.length * 0.3)
    },
    Performance: {
      positive: ["Performs well"],
      negative: ["Issues encountered"],
      mentions: Math.floor(reviews.length * 0.3)
    }
  };
};

export const generateMostAppreciated = (reviews: any[], category: string): string[] => {
  const cat = category.toLowerCase();
  if (cat.includes("phone") || cat.includes("laptop"))
    return ["Great performance", "Good battery life", "Excellent display"];
  if (cat.includes("clothing"))
    return ["Nice fabric", "Good fit", "Stylish design"];
  if (cat.includes("book"))
    return ["Great story", "Well-written", "Engaging read"];
  return ["Reliable", "Good quality", "Value for money"];
};

export const generateLeastAppreciated = (reviews: any[], category: string): string[] => {
  const cat = category.toLowerCase();
  if (cat.includes("phone") || cat.includes("laptop"))
    return ["Battery drains fast", "Heating issues", "Customer service"];
  if (cat.includes("clothing"))
    return ["Size mismatch", "Color fades", "Low quality stitching"];
  if (cat.includes("book"))
    return ["Boring story", "Poor editing", "Weak plot"];
  return ["Late delivery", "Packaging issues", "Not worth the price"];
};
