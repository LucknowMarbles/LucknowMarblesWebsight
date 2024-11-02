import React, { useState } from 'react';
import { Input, Button, Card, Spin, Select, message } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const AIContentGenerator = ({ onContentGenerated, productData }) => {
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('description');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  const contentTypes = {
    description: {
      title: 'Product Description',
      prompt: `Generate a detailed product description for ${productData?.name || 'this product'}. Include key features, benefits, and unique selling points.`
    },
    seo: {
      title: 'SEO Content',
      prompt: `Generate SEO-optimized content for ${productData?.name || 'this product'}, including meta description, keywords, and title tags.`
    },
    features: {
      title: 'Product Features',
      prompt: `List the main features and specifications of ${productData?.name || 'this product'} in a clear, bullet-point format.`
    }
  };

  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/ai/generate-content', {
        prompt: prompt || contentTypes[contentType].prompt,
        productData,
        contentType
      });

      setGeneratedContent(response.data.content);
      if (onContentGenerated) {
        onContentGenerated(contentType, response.data.content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      message.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="AI Content Generator" className="mb-4">
      <div className="space-y-4">
        <Select
          value={contentType}
          onChange={setContentType}
          className="w-full"
        >
          {Object.entries(contentTypes).map(([key, value]) => (
            <Option key={key} value={key}>{value.title}</Option>
          ))}
        </Select>

        <TextArea
          rows={4}
          placeholder="Custom prompt (optional)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full"
        />

        <Button
          type="primary"
          onClick={generateContent}
          loading={loading}
          className="w-full"
        >
          Generate {contentTypes[contentType].title}
        </Button>

        {loading && (
          <div className="text-center">
            <Spin />
            <p className="mt-2">Generating content...</p>
          </div>
        )}

        {generatedContent && (
          <Card title="Generated Content" className="mt-4">
            <TextArea
              rows={8}
              value={generatedContent}
              readOnly
              className="w-full"
            />
            <Button
              type="primary"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(generatedContent);
                message.success('Content copied to clipboard!');
              }}
            >
              Copy to Clipboard
            </Button>
          </Card>
        )}
      </div>
    </Card>
  );
};

export default AIContentGenerator;
