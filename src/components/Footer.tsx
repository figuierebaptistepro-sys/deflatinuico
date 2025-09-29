import React from 'react'
import { Shield, Twitter, Send, Globe, FileText, Mail, Coins, Instagram, MessageCircle } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 md:space-x-4 mb-6 md:mb-8">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">
                <span className="text-orange-400">DEFLATINU</span>
              </span>
            </div>
            <p className="text-gray-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-lg">
              The revolutionary deflationary token that protects investors and rewards long-term holders.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <a href="#" className="w-10 md:w-12 h-10 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors shadow-lg">
                <Twitter className="w-6 h-6 text-white" />
              </a>
              <a href="https://discord.gg/YkMpHR65" target="_blank" rel="noopener noreferrer" className="w-10 md:w-12 h-10 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </a>
              <a href="#" className="w-10 md:w-12 h-10 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors shadow-lg">
                <Instagram className="w-6 h-6 text-white" />
              </a>
              <a href="#" className="w-10 md:w-12 h-10 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg">
                <Send className="w-6 h-6 text-white" />
              </a>
              <a href="#" className="w-10 md:w-12 h-10 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Navigation</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><a href="#ico" className="text-gray-400 hover:text-orange-400 transition-colors text-sm md:text-lg">ICO</a></li>
              <li><a href="#tokenomics" className="text-gray-400 hover:text-orange-400 transition-colors text-sm md:text-lg">Tokenomics</a></li>
              <li><a href="#roadmap" className="text-gray-400 hover:text-orange-400 transition-colors text-sm md:text-lg">Roadmap</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm md:text-lg">FAQ</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Resources</h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center text-sm md:text-lg">
                  <FileText className="w-5 h-5 mr-3" />
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center text-sm md:text-lg">
                  <Shield className="w-5 h-5 mr-3" />
                  Security Audit
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center text-sm md:text-lg">
                  <Globe className="w-5 h-5 mr-3" />
                  Smart Contract
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Stats */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Live Statistics</h4>
            
            {/* Quick Buy Widget */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-orange-500/20 to-blue-600/20 rounded-xl p-4 border border-orange-500/30">
                <h5 className="text-orange-400 font-semibold mb-2 text-sm">🔥 ICO en cours</h5>
                <button
                  onClick={() => {
                    // Scroll to the Purchase Tokens section specifically
                    const icoSection = document.querySelector('#ico')
                    if (icoSection) {
                      icoSection.scrollIntoView({ behavior: 'smooth' })
                      // Wait for scroll to complete, then focus on purchase form
                      setTimeout(() => {
                        const purchaseForm = icoSection.querySelector('input[type="number"]')
                        if (purchaseForm) {
                          purchaseForm.focus()
                        }
                      }, 1000)
                    }
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm flex items-center justify-center space-x-2"
                >
                  <Coins className="w-4 h-4" />
                  <span>Acheter DEFLAT</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="text-2xl md:text-3xl font-bold text-orange-400">$817,500</div>
                <div className="text-gray-400 text-sm md:text-base">Raised in ICO</div>
              </div>
              <div className="bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="text-2xl md:text-3xl font-bold text-blue-400">2,847</div>
                <div className="text-gray-400 text-sm md:text-base">Investors</div>
              </div>
            </div>
            <div className="mt-6 md:mt-8">
              <a href="mailto:contact@deflatinu.com" className="flex items-center text-gray-400 hover:text-orange-400 transition-colors text-sm md:text-lg">
                <Mail className="w-5 h-5 mr-3" />
                contact@deflatinu.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 md:pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm md:text-base">
              © 2025 DEFLAT INU. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm md:text-base">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm md:text-base">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm md:text-base">Legal Notice</a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 md:mt-12 bg-red-900/20 border border-red-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8">
          <h5 className="text-red-400 font-semibold mb-3 md:mb-4 text-base md:text-lg">⚠️ Important Warning</h5>
          <p className="text-gray-400 leading-relaxed text-sm md:text-base">
            Cryptocurrencies are high-risk investments. Value can fluctuate dramatically. 
            Never invest more than you can afford to lose. 
            This project is not regulated and may involve significant risks. 
            Always do your own research (DYOR) before investing.
          </p>
        </div>
      </div>
    </footer>
  )
}