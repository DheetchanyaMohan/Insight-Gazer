export const analyzeReviewsWithOpenAI = async (productName: string, reviews: any[]) => {
    try {
        const MAX_REVIEWS = 20;
        const limitedReviews = reviews.slice(0, MAX_REVIEWS);

        const response = await fetch('/api/analyze-reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName,
                reviews: limitedReviews, // ✅ send only a subset
            }),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        const { analysis } = await response.json();
        return analysis;
    } catch (error) {
        console.error(`Failed to analyze ${productName}:`, error);
        throw error;
    }
};
