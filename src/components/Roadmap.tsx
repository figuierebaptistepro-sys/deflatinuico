import React from 'react'
import { CheckCircle, Circle, Clock, Rocket, Users, TrendingUp, Globe, Zap, Coins } from 'lucide-react'

interface RoadmapItem {
  phase: string
  title: string
  status: 'completed' | 'active' | 'upcoming'
  items: string[]
  icon: any
  date: string
}

export const Roadmap: React.FC = () => {
  const roadmapData: RoadmapItem[] = [
    {
      phase: "Phase 1",
      title: "Launch & ICO",
      status: "active",
      date: "Q1 2025",
      icon: Rocket,
      items: [
        "Deflationary smart contract development",
        "Security audit by blockchain experts",
        "Launch ICO in 4 progressive rounds",
        "Implementation of progressive tax system",
        "Automatic buyback interface"
      ]
    },
    {
      phase: "Phase 2", 
      title: "Listing & Community",
      status: "upcoming",
      date: "Q2 2025",
      icon: Users,
      items: [
        "DEX listing (Uniswap, PancakeSwap)",
        "Aggressive marketing campaign",
        "Partnerships with crypto influencers",
        "Airdrops for early adopter community",
        "Governance dashboard development"
      ]
    },
    {
      phase: "Phase 3",
      title: "Expansion & Utility",
      status: "upcoming", 
      date: "Q3 2025",
      icon: TrendingUp,
      items: [
        "Centralized exchange listings (CEX)",
        "DEFLAT INU staking launch",
        "Long-term holder rewards program",
        "DeFi ecosystem integration",
        "Strategic partnerships with other projects"
      ]
    },
    {
      phase: "Phase 4",
      title: "Global Ecosystem",
      status: "upcoming",
      date: "Q4 2025",
      icon: Globe,
      items: [
        "DEFLAT INU DAO launch",
        "NFT marketplace with holder discounts",
        "Multi-chain bridge (ETH, BSC, MATIC)",
        "Mobile trading application",
        "International expansion and regulatory compliance"
      ]
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'active':
        return <Zap className="w-6 h-6 text-orange-500 animate-pulse" />
      default:
        return <Circle className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50'
      case 'active':
        return 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  return (
    <section id="roadmap" className="py-12 md:py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            <span className="text-orange-500">Roadmap</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Our strategic vision to make DEFLAT INU the leader in deflationary tokens
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-blue-500 to-purple-500 transform md:-translate-x-1/2 rounded-full"></div>

          <div className="space-y-12 md:space-y-16">
            {roadmapData.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div key={index} className={`relative flex flex-col lg:flex-row items-start ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-12`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-6 md:left-1/2 w-4 md:w-6 h-4 md:h-6 bg-white rounded-full border-2 md:border-4 border-orange-500 transform md:-translate-x-1/2 mt-8 md:mt-12 z-10 shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`flex-1 ml-12 md:ml-16 lg:ml-0 ${index % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                    <div className={`rounded-2xl md:rounded-3xl p-6 md:p-10 border-2 transition-all duration-500 hover:scale-105 shadow-xl ${getStatusColor(item.status)}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 md:mb-8">
                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl mr-0 sm:mr-6 mb-4 sm:mb-0 ${item.status === 'active' ? 'bg-orange-100' : 'bg-gray-100'} shadow-lg`}>
                          <IconComponent className={`w-8 h-8 ${item.status === 'active' ? 'text-orange-500' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2">
                            {getStatusIcon(item.status)}
                            <span className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider mt-1 sm:mt-0">{item.phase}</span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{item.title}</h3>
                          <p className="text-orange-500 font-semibold text-base md:text-lg">{item.date}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {item.items.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm md:text-lg">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {item.status === 'active' && (
                        <div className="mt-6 md:mt-8 bg-orange-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-orange-200">
                          <div className="flex items-center">
                            <Clock className="w-6 h-6 text-orange-500 mr-3" />
                            <span className="text-orange-700 font-semibold text-sm md:text-lg">Currently in development</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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
              <a 
                href="https://deflatinu.gitbook.io/deflatinu-docs/" 
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 md:px-12 py-4 md:py-5 rounded-full font-semibold text-lg md:text-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Whitepaper</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}