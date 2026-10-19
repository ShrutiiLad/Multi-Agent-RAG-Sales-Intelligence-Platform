import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

const faqs = [
  {
    question: 'How does the AI understand my documents?',
    answer:
      'The AI utilizes advanced natural language processing (NLP) and machine learning algorithms to analyze the content of your documents, extracting key information and understanding the context to provide accurate answers.',
  },
  {
    question: 'What types of documents does the AI support?',
    answer:
      'Currently, the AI supports PDF documents. However, we are actively working to expand its capabilities to include other formats such as text documents (DOCX, TXT), presentations (PPT, PPTX), spreadsheets (XLS, XLSX), and more. Stay tuned for future updates as we enhance our support for diverse document types commonly used in various industries.',
  },
  {
    question: 'How accurate are the answers provided by the AI?',
    answer:
      'The AI is designed to provide highly accurate answers by leveraging state-of-the-art algorithms and models. It continuously learns and improves its performance to deliver reliable responses, often with precision comparable to human expertise.',
  },
  {
    question: 'Can the AI handle documents in multiple languages?',
    answer:
      'Yes, the AI supports multiple languages and can process documents written in different languages. Its multilingual capabilities enable it to provide answers and insights across a diverse range of linguistic contexts.',
  },
  {
    question: 'Is my data secure when using the AI?',
    answer:
      'Absolutely. We take data security seriously and employ robust measures to safeguard your information. This includes encryption of data both in transit and at rest, strict access controls, and compliance with industry-standard security protocols.',
  },
  {
    question:
      'How does the AI handle sensitive or confidential information in my documents?',
    answer:
      'The AI employs advanced techniques such as redaction, anonymization, and access controls to handle sensitive or confidential information securely. You can configure the AI to exclude certain types of content from processing or apply additional privacy measures as needed.',
  },
  {
    question:
      "Can I customize the AI's responses to suit my specific needs or industry?",
    answer:
      'Yes, the AI provides customization options to tailor its responses to your specific requirements or industry domain. This includes the ability to train the AI on domain-specific terminology, adjust response preferences, and integrate with external knowledge bases.',
  },
  {
    question: 'What kind of questions can I ask the AI about my documents?',
    answer:
      'You can ask the AI a wide range of questions about your documents, from simple factual queries to more complex inquiries requiring analysis and synthesis. The AI is adept at understanding context and providing insightful answers based on the content of your documents.',
  },
  {
    question:
      'Does the AI learn from user interactions to improve its performance over time?',
    answer:
      'Absolutely. The AI continuously learns and improves its performance based on user interactions, feedback, and new data. It adapts its algorithms and models to better understand user needs and provide more accurate and relevant responses over time.',
  },
];

const Questions = () => {
  return (
    <ScrollArea
      className="overflow-auto w-full"
      style={{
        maxHeight: 'calc(100vh - 150px)',
        scrollbarWidth: 'none',
      }}
    >
      <Accordion type="multiple" className="w-full pr-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
};

export default Questions;
