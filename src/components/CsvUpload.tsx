import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { ProductData } from "@/pages/Index";
import { parseCSVData, validateCSVHeaders } from "@/utils/csvParser";
import { processReviewsWithOpenAI } from "@/services/reviewProcessor";

interface CsvUploadProps {
  onDataExtracted: (data: ProductData[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CsvUpload = ({ onDataExtracted, isProcessing, setIsProcessing }: CsvUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain headers and at least one row of data.");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      validateCSVHeaders(headers);

      console.log('CSV Headers detected:', headers);

      const reviews = parseCSVData(lines, headers);
      console.log('Total reviews parsed:', reviews.length);

      const processedData = await processReviewsWithOpenAI(reviews);
      onDataExtracted(processedData);

    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process the CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Upload Your CSV File</h2>
          <p className="text-purple-200">
            Upload a CSV file containing product reviews to extract meaningful features and insights using Google Gemini Pro.
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-purple-400 bg-purple-400/10' 
              : 'border-white/30 hover:border-white/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
              <div>
                <p className="text-lg font-medium">Processing your data...</p>
                <p className="text-sm text-purple-200">This may take a few moments</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-purple-400" />
              <div>
                <p className="text-lg font-medium">
                  {fileName ? `Selected: ${fileName}` : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-purple-200">
                  or click to browse files
                </p>
              </div>
              <Button
                variant="secondary"
                className="bg-purple-600 hover:bg-purple-700 text-white border-none"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>

        <Alert className="mt-6 bg-blue-500/10 border-blue-400/30 text-blue-100">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>CSV Format:</strong> Your file should contain columns for 'product_id' or 'product_title', 
            'review_text', and optionally 'category', 'rating', and 'sentiment'. Each row represents one review.
            <br />
            <strong>Note:</strong> Make sure your backend server is running on http://localhost:3001
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CsvUpload;