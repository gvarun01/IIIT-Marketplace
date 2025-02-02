import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const Footer = () => {
  return (
    <footer className="bg-[#2A363B] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto mb-12 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Stay Updated with Latest Offers
          </h3>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#99B898] focus:border-transparent"
            />
            <button className="px-6 py-2 bg-[#99B898] text-white rounded-full hover:bg-[#7a9479] transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4 text-[#99B898]">IIIT Market</h4>
            <p className="text-sm text-white/70">
              Your trusted platform for buying and selling within the IIIT community.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#99B898]">COMPANY</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">About</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Features</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Works</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Career</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#99B898]">HELP</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Customer Support</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Delivery Details</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Terms & Conditions</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#99B898]">FAQ</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Account</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Manage Deliveries</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Orders</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Payments</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#99B898]">RESOURCES</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">User Guide</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Seller Tips</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Blog</li>
              <li className="hover:text-[#99B898] transition-colors cursor-pointer">Community</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/50">
            © 2024 IIIT Market. All Rights Reserved
          </p>
          <div className="flex space-x-4 text-white/50">
            <span className="hover:text-[#99B898] cursor-pointer transition-colors">UPI</span>
            <span className="hover:text-[#99B898] cursor-pointer transition-colors">Cash</span>
            <span className="hover:text-[#99B898] cursor-pointer transition-colors">Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};