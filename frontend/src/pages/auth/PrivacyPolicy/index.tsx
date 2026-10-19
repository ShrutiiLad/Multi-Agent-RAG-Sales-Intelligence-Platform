import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Define your privacy policy data here
const privacyPolicyData = [
  {
    heading: 'Privacy',
    content: 'At Echo AI, we prioritize the privacy and security of our users. We are committed to protecting your personal information and ensuring its confidentiality.',
  },
  {
    heading: 'Consent',
    content: 'By using our services, you consent to the collection, use, and sharing of your information as described in this Privacy Policy. If you do not agree with any part of this policy, please do not use our services.',
  },
  {
    heading: 'Information we collect',
    content: 'We collect various types of information to provide and improve our services. This may include personal information such as name, email address, and other details you provide to us.',
  },
  {
    heading: 'How we use your Information',
    content: 'We use the information we collect to personalize your experience, communicate with you, analyze trends, and improve our services. We do not sell your information to third parties.',
  },
];

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex items-center justify-center my-4 overflow-hidden">
      <Card className=" border-none shadow-none w-3/5 overflow-hidden">
        <CardHeader>
          <CardTitle className='mb-2 text-selected'>Privacy Policy</CardTitle>
          <CardDescription>Privacy Policy for Echo AI as per the Year 2024</CardDescription>
          <Separator className='h-0.5 my-2' />
          <p className='text-sm leading-6 text-selected'>{"At Echo AI, we prioritize the privacy and security of our users. We are committed to protecting your personal information and ensuring its confidentiality. By using our services, you consent to the collection, use, and sharing of your information as described in this Privacy Policy. If you do not agree with any part of this policy, please do not use our services. We collect various types of information to provide and improve our services. This may include personal information such as name, email address, and other details you provide to us. We use the information we collect to personalize your experience, communicate with you, analyze trends, and improve our services. We do not sell your information to third parties."}</p>
          <CardContent className='p-0 text-selected'>
            {privacyPolicyData.map((section, index) => (
              <div key={index}>
                <h2 className="text-lg font-semibold my-2">{section.heading}</h2>
                <Separator className='h-[1px] my-2' />
                <p className='text-sm leading-6'>{section.content}</p>
              </div>
            ))}
          </CardContent>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
