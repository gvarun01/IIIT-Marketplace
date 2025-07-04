import React from "react";
import { Hero } from "@/components/home/Hero";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star, Sparkles, Gift, Rainbow, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChatButton } from "@/components/chat/ChatButton";
import Cookies from "js-cookie";

const Index = () => {
  const features = [
    {
      icon: <Star className="w-6 h-6 text-[#8B5CF6]" />,
      title: "Verified Students",
      description: "All users are verified IIIT students, ensuring a trusted community."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#D946EF]" />,
      title: "Secure Transactions",
      description: "Safe and transparent payment system for worry-free trading."
    },
    {
      icon: <Gift className="w-6 h-6 text-[#F97316]" />,
      title: "Campus Delivery",
      description: "Quick and convenient delivery right to your hostel or department."
    },
    {
      icon: <Rainbow className="w-6 h-6 text-[#0EA5E9]" />,
      title: "Best Deals",
      description: "Find the best prices on textbooks, electronics, and more."
    }
  ];

  // const popularItems = [
  //   {
  //     image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974",
  //     title: "Engineering Textbooks",
  //     price: "₹499",
  //     category: "Books",
  //     gradient: "from-[#FEC6A1] to-[#FDE1D3]"
  //   },
  //   {
  //     image: "https://images.unsplash.com/photo-1527814050087-3793815479db",
  //     title: "Scientific Calculator",
  //     price: "₹899",
  //     category: "Electronics",
  //     gradient: "from-[#E5DEFF] to-[#D3E4FD]"
  //   },
  //   {
  //     image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6",
  //     title: "Study Desk Lamp",
  //     price: "₹699",
  //     category: "Home",
  //     gradient: "from-[#FFDEE2] to-[#FDE1D3]"
  //   },
  //   {
  //     image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  //     title: "Wireless Headphones",
  //     price: "₹1,299",
  //     category: "Electronics",
  //     gradient: "from-[#F2FCE2] to-[#FEF7CD]"
  //   }
  // ];

  const accessToken = Cookies.get("accessToken");
  console.log("Access token:", accessToken);
  console.log("Cookie names:", Cookies.get());
  // console.log
  console.log("All cookies:", document.cookie);


  return (

    <>
    <Navbar />
    <div className="min-h-screen bg-[#FDF8F3]">
      <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM" />
      <Hero />


      {/* Features Section with Animation */}
      <section className="py-20 bg-gradient-to-b from-white to-[#FDF8F3]">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center text-[#2A363B] mb-16"
          >
            Why Choose Campus Marketplace?
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-[#FDF8F3] flex items-center justify-center mb-4 group-hover:animate-bounce">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#2A363B] mb-2">{feature.title}</h3>
                <p className="text-[#4A5859]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-[#2A363B] to-[#435055] text-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-16"
          >
            What Students Say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg p-6 rounded-xl hover:bg-white/15 transition-colors">
                  <Star className="w-6 h-6 text-[#F97316] mb-4" />
                  <p className="text-white/90 mb-4">
                    "Campus Marketplace made it super easy to sell my old textbooks and find great deals on electronics. Highly recommended!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#D946EF]" />
                    <div>
                      <p className="font-medium">Student Name</p>
                      <p className="text-sm text-white/70">Computer Science, 3rd Year</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Animation */}
      <section className="py-20 bg-gradient-to-r from-[#99B898] via-[#FECEA8] to-[#E8B4A2]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join the Community?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start buying and selling with your fellow students today. Join hundreds of satisfied users on Campus Marketplace.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#2A363B] px-8 py-4 rounded-full text-lg font-medium hover:bg-[#FDF8F3] transition-all inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Index;

