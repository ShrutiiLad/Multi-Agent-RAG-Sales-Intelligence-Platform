import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Questions from '@/pages/help/FAQ/questions';

const FAQPage: React.FC = () => {
  return (
    <div className="flex items-center justify-start my-4">
      <Card className=" border-none shadow-none w-4/5">
        <CardHeader>
          <CardTitle>Hello, how can we help you?</CardTitle>
          <CardDescription>
            FAQs, quick fixes, and official info on every GEM AI feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Questions />
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQPage;
