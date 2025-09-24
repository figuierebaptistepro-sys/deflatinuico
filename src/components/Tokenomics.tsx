import React from 'react'
import { PieChart, TrendingDown, Shield, Repeat, Users, Wallet, Coins } from 'lucide-react'

export const Tokenomics: React.FC = () => {
  const taxDistribution = [
    { label: 'Auto Buyback', percentage: 50, color: 'bg-orange-500', icon: Repeat },
    { label: 'Staking/Stable Placement', percentage: 20, color: 'bg-blue-500', icon: TrendingDown },
    { label: 'Marketing/Development', percentage: 20, color: 'bg-purple-500', icon: Users },
    { label: 'Team', percentage: 5, color: 'bg-green-500', icon: Wallet },
    { label: 'Reserve', percentage: 5, color: 'bg-gray-500', icon: Shield }
  ]

  const supplyDistribution = [
    { label: 'Public ICO', percentage: 70, amount: '70M DEFLAT', color: 'bg-orange-500' },
    { label: 'Team (Locked)', percentage: 10, amount: '10M DEFLAT', color: 'bg-blue-500' },
    { label: 'Community Airdrops', percentage: 10, amount: '10M DEFLAT', color: 'bg-purple-500' },
    { label: 'DEX Liquidity', percentage: 5, amount: '5M DEFLAT', color: 'bg-green-500' },
    { label: 'Marketing Reserve', percentage: 5, amount: '5M DEFLAT', color: 'bg-gray-500' }
  ]

  return (
    <section id="tokenomics" className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            <span className="text-orange-500">Tokenomics</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Advanced deflationary mechanisms with progressive tax system and automatic buyback
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Tax Structure */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center">
              <Shield className="w-8 h-8 text-orange-500 mr-4" />
              Tax Structure
            </h3>
            
            <div className="space-y-6 md:space-y-8">
              <div className="bg-red-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-red-200">
                <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Progressive Sell Taxes</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm md:text-lg">Launch (Year 1)</span>
                    <span className="text-red-500 font-bold text-2xl md:text-3xl">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm md:text-lg">After 2 years</span>
                    <span className="text-yellow-500 font-bold text-2xl md:text-3xl">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm md:text-lg">After 4 years</span>
                    <span className="text-green-500 font-bold text-2xl md:text-3xl">0%</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-blue-200">
                <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Permanent Taxes</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm md:text-lg">Anti-inflation & Funding</span>
                  <span className="text-blue-500 font-bold text-2xl md:text-3xl">10%</span>
                </div>
                <p className="text-gray-600 mt-3 text-sm md:text-base">
                  Applied for life to maintain project stability
                </p>
              </div>
            </div>
          </div>

          {/* Tax Distribution */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center">
              <PieChart className="w-8 h-8 text-blue-500 mr-4" />
              Tax Distribution
            </h3>
            
            <div className="space-y-6">
              {taxDistribution.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={index} className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <IconComponent className="w-6 h-6 text-gray-600 mr-4" />
                        <span className="text-gray-900 font-medium text-sm md:text-lg">{item.label}</span>
                      </div>
                      <span className="text-gray-900 font-bold text-lg md:text-xl">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Supply Distribution */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xl mb-12 md:mb-16">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
            Supply Distribution - <span className="text-orange-500 block sm:inline">100M DEFLAT INU</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {supplyDistribution.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-orange-500 transition-all duration-300 hover:shadow-xl">
                  <div className={`w-16 md:w-20 h-16 md:h-20 ${item.color} rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg md:text-2xl">{item.percentage}%</span>
                  </div>
                  <div className="text-orange-500 font-semibold text-sm md:text-lg mb-2 md:mb-3">{item.amount}</div>
                  <div className="text-gray-700 text-sm md:text-base">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="bg-orange-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-orange-200 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <TrendingDown className="w-12 h-12 text-orange-500 mx-auto mb-6" />
            <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Deflationary</h4>
            <p className="text-gray-600 text-sm md:text-base">Supply decreases through burn mechanisms</p>
          </div>
          
          <div className="bg-blue-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-blue-200 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <Repeat className="w-12 h-12 text-blue-500 mx-auto mb-6" />
            <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Auto-Buyback</h4>
            <p className="text-gray-600 text-sm md:text-base">50% of taxes used for automatic buyback</p>
          </div>
          
          <div className="bg-purple-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-purple-200 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <Shield className="w-12 h-12 text-purple-500 mx-auto mb-6" />
            <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Anti-Dump</h4>
            <p className="text-gray-600 text-sm md:text-base">High taxes discourage speculation</p>
          </div>
          
          <div className="bg-green-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-green-200 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <Users className="w-12 h-12 text-green-500 mx-auto mb-6" />
            <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Rewards</h4>
            <p className="text-gray-600 text-sm md:text-base">Holders rewarded by supply reduction</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 md:mt-24 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl md:rounded-3xl p-8 md:p-16 border border-orange-200 shadow-xl">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
              Rejoignez l'aventure DEFLAT INU
            </h3>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
              Soyez parmi les premiers à investir dans l'avenir des tokens déflationnistes
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8">
              <button 
                onClick={() => {
                  const icoSection = document.querySelector('#ico')
                  if (icoSection) {
                    icoSection.scrollIntoView({ behavior: 'smooth' })
                    // Focus on purchase form after scroll
                    setTimeout(() => {
                      const purchaseForm = icoSection.querySelector('input[type="number"]')
                      if (purchaseForm) {
                        purchaseForm.focus()
                      }
                    }, 1000)
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-semibold text-lg md:text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
              >
                <Coins className="w-6 h-6" />
                <span>Rejoindre l'ICO</span>
              </button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 md:px-12 py-4 md:py-5 rounded-full font-semibold text-lg md:text-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                Rejoindre Telegram
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}