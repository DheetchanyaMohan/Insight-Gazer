
import { useState } from "react";
import { Upload, FileText, Sparkles, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import CsvUpload from "@/components/CsvUpload";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";

export interface ProductData {
  productName: string;
  category: string;
  features: {
    [key: string]: {
      positive: string[];
      negative: string[];
      mentions: number;
    };
  };
  summary: {
    mostAppreciated: string[];
    leastAppreciated: string[];
    overallSentiment: 'positive' | 'neutral' | 'negative';
  };
  reviewCount: number;
}

const Index = () => {
  const [extractedData, setExtractedData] = useState<ProductData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDataExtracted = (data: ProductData[]) => {
    setExtractedData(data);
    toast({
      title: "Analysis Complete!",
      description: `Successfully analyzed ${data.length} product${data.length > 1 ? 's' : ''} from your CSV file.`,
    });
  };

  const handleExportAll = () => {
    const exportData = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-features-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported Successfully!",
      description: "Your analysis has been downloaded as a JSON file.",
    });
  };

  const handleCopyAll = () => {
    const textData = extractedData.map(product => {
      const features = Object.entries(product.features)
        .map(([feature, data]) => `${feature}: ${data.mentions} mentions`)
        .join(', ');
      
      return `${product.productName} (${product.category})\nFeatures: ${features}\nMost Appreciated: ${product.summary.mostAppreciated.join(', ')}\nLeast Appreciated: ${product.summary.leastAppreciated.join(', ')}\n\n`;
    }).join('');

    navigator.clipboard.writeText(textData);
    toast({
      title: "Copied to Clipboard!",
      description: "All product analyses have been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Hero />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <CsvUpload 
            onDataExtracted={handleDataExtracted}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />

          {extractedData.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Analysis Results
                  </h2>
                  <p className="text-purple-200">
                    Found {extractedData.length} product{extractedData.length > 1 ? 's' : ''} in your data
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyAll}
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                  <Button
                    onClick={handleExportAll}
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {extractedData.map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
