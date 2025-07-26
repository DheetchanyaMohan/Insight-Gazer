import { ProductData } from "@/pages/Index";
import { analyzeReviewsWithOpenAI } from "./reviewService";
import { groupReviewsByProduct, parseAIResponse, createFallbackAnalysis } from "@/utils/dataProcessor";

export const processReviewsWithOpenAI = async (reviews: any[]): Promise<ProductData[]> => {
  const results: ProductData[] = [];

  try {
    const productGroups = groupReviewsByProduct(reviews);

    for (const [productKey, productReviews] of Object.entries(productGroups)) {
      const productName = productReviews[0].productName || productKey;

      try {
        const analysis = await analyzeReviewsWithOpenAI(productName, productReviews);
        const parsed = parseAIResponse(analysis, productReviews, productName);
        results.push(parsed);
      } catch (productError) {
        console.error(`API failed for product ${productName}. Using fallback.`, productError);
        results.push(createFallbackAnalysis(productReviews, productName));
      }
    }
  } catch (globalError) {
    console.error('Unexpected error in processing reviews:', globalError);
  }

  return results;
};
