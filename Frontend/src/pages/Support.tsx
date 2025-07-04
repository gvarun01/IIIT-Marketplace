import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Headset, Mail, MessageCircle, Phone, HelpCircle, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChatButton } from "@/components/chat/ChatButton";
const supportChannels = [
  {
    id: 1,
    name: "Phone Support",
    description: "Talk to our support team directly",
    icon: Phone,
    contact: "+1 (555) 123-4567",
    availability: "Mon-Fri, 9 AM - 6 PM",
  },
  {
    id: 2,
    name: "Email Support",
    description: "Send us an email anytime",
    icon: Mail,
    contact: "support@shop.co",
    availability: "24/7 Response within 24 hours",
  },
  {
    id: 3,
    name: "Live Chat",
    description: "Chat with our support team",
    icon: MessageCircle,
    contact: "Available 24/7",
    availability: "Average response time: 5 minutes",
  },
];
const faqs = [
  {
    question: "How do I track my order?",
    answer: "You can track your order by logging into your account and visiting the 'Orders' section. There you'll find real-time updates on your package's location and estimated delivery time.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various UPI payment methods for Indian customers.",
  },
  {
    question: "How can I return an item?",
    answer: "To return an item, go to your order history, select the item you wish to return, and follow the return instructions. Returns must be initiated within 7 days of delivery.",
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption and security measures to protect your personal and payment information. We never share your data with third parties.",
  },
];
const Support = () => {

  const GEMINI_API_KEY = "AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM";

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
      <ChatButton apiKey={GEMINI_API_KEY} />
        <div className="max-w-6xl mx-auto space-y-12">
          <section>
            <h1 className="text-4xl font-bold mb-8 flex items-center gap-2 text-[#2A363B]">
              <Headset className="h-8 w-8 text-[#99B898]" />
              Customer Support
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportChannels.map((channel) => (
                <Card key={channel.id} className="border border-[#E8B4A2]/20 hover:shadow-lg transition-all">
                  <div className="p-6 space-y-4">
                    <div className="p-3 bg-[#99B898]/10 w-fit rounded-xl">
                      <channel.icon className="h-6 w-6 text-[#99B898]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#2A363B]">{channel.name}</h3>
                    <p className="text-[#4A5859]">{channel.description}</p>
                    <div className="space-y-2">
                      <p className="font-medium text-[#2A363B]">{channel.contact}</p>
                      <p className="text-sm text-[#4A5859]">{channel.availability}</p>
                    </div>
                    <Button className="w-full bg-[#99B898] hover:bg-[#7a9479] text-white">
                      Contact Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
          <section className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#2A363B]">
                <HelpCircle className="h-6 w-6 text-[#99B898]" />
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="border border-[#E8B4A2]/20 rounded-lg overflow-hidden bg-white"
                  >
                    <AccordionTrigger className="px-4 hover:bg-[#F8E5D5]/50">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-[#4A5859]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#2A363B]">
                <FileText className="h-6 w-6 text-[#99B898]" />
                Submit a Request
              </h2>
              <Card className="border border-[#E8B4A2]/20">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Your Name" 
                      className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input 
                      type="email" 
                      placeholder="Email Address"
                      className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Subject"
                      className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Describe your issue..."
                      className="min-h-[150px] border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                    />
                  </div>
                  <Button className="w-full bg-[#99B898] hover:bg-[#7a9479] text-white">
                    <Send className="h-4 w-4 mr-2" /> Submit Request
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Support;