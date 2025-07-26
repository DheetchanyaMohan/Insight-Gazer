
import { useState } from "react";
import { Star, TrendingUp, TrendingDown, Copy, ExternalLink, Package } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ProductData } from "@/pages/Index";

interface ProductCardProps {
  product: ProductData;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    const features = Object.entries(product.features)
      .map(([feature, data]) => `${feature}: ${data.mentions} mentions`)
      .join(', ');
    
    const text = `${product.productName} (${product.category})\nFeatures: ${features}\nMost Appreciated: ${product.summary.mostAppreciated.join(', ')}\nLeast Appreciated: ${product.summary.leastAppreciated.join(', ')}`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${product.productName} analysis copied to clipboard.`,
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <Card 
      className={`bg-white/10 backdrop-blur-md border-white/20 text-white transition-all duration-500 cursor-pointer hover:scale-105 hover:bg-white/15 ${
        isExpanded ? 'scale-105 bg-white/15' : ''
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-lg line-clamp-2">{product.productName}</h3>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-purple-600/30 text-purple-200 border-purple-400/30"
            >
              {product.category}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-200">Reviews analyzed</span>
          <Badge variant="outline" className="border-white/30 text-white">
            {product.reviewCount}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className={getSentimentColor(product.summary.overallSentiment)}>
            {getSentimentIcon(product.summary.overallSentiment)}
          </span>
          <span className="text-sm text-purple-200">
            Overall sentiment: {' '}
            <span className={getSentimentColor(product.summary.overallSentiment)}>
              {product.summary.overallSentiment}
            </span>
          </span>
        </div>

        <div 
          className={`transition-all duration-500 overflow-hidden ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-4 pt-4 border-t border-white/20">
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Most Appreciated
              </h4>
              <ul className="text-xs space-y-1">
                {product.summary.mostAppreciated.map((item, index) => (
                  <li key={index} className="text-green-200">• {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Least Appreciated
              </h4>
              <ul className="text-xs space-y-1">
                {product.summary.leastAppreciated.map((item, index) => (
                  <li key={index} className="text-red-200">• {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Features</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(product.features).slice(0, 3).map(([feature, data]) => (
                  <div key={feature} className="flex justify-between items-center text-xs">
                    <span className="text-purple-200">{feature}</span>
                    <Badge 
                      variant="outline" 
                      className="border-purple-400/30 text-purple-300 text-xs"
                    >
                      {data.mentions} mentions
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!isExpanded && (
          <div className="text-center">
            <p className="text-xs text-purple-300">Hover to see detailed analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
