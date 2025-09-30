import React from 'react'
import { Shield, Twitter, Send, Globe, FileText, Mail, Coins, Instagram, MessageCircle } from 'lucide-react'
import { useManualTotal } from '../hooks/useManualTotal'

// Discord SVG Icon Component
const DiscordIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
  </svg>
)
export const Footer: React.FC = () => {
  const { data: manualTotalData } = useManualTotal()

  return (
    <footer className="bg-gray-900 py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-6 md:mb-8">
              <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/DEFLATINU LOGO.png" 
                  alt="DEFLAT INU Logo" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    console.log('Logo failed to load, using fallback')
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-orange-500 font-bold text-4xl">🐕</span>'
                  }}
                />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-bold text-white">
                <span className="text-orange-400">DEFLATINU</span>
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-lg">
              The revolutionary deflationary token that protects investors and rewards long-term holders.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <a href="#" className="w-10 md:w-12 h-10 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors shadow-lg">
                <Twitter className="w-6 h-6 text-white" />
              </a>
              <a href="https://discord.gg/YkMpHR65" target="_blank" rel="noopener noreferrer" className="w-10 md:w-12 h-10 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg">
                <DiscordIcon className="w-6 h-6 text-white" />
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
                <a href="https://deflatinu.gitbook.io/deflatinu-docs/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center text-sm md:text-lg">
                  <FileText className="w-5 h-5 mr-3" />
                  Whitepaper
                </a>
              </li>
              <li><a href="#faq" className="text-gray-400 hover:text-orange-400 transition-colors text-sm md:text-lg">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm md:text-lg">Support</a></li>
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
                <div className="text-2xl md:text-3xl font-bold text-orange-400">
                  ${(manualTotalData?.total_raised || 817500).toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm md:text-base">
                  Raised in ICO
                </div>
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
            <div className="text-gray-500 text-sm md:text-base">
              Built with ❤️ for the crypto community
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