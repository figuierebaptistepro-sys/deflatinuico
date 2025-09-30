import React, { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Shield, Coins, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  icon: any
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqData: FAQItem[] = [
    {
      question: "Qu'est-ce que DEFLAT INU ?",
      answer: "DEFLAT INU est un token déflationniste révolutionnaire avec un système de taxes progressives et des mécanismes de buyback automatique. Il est conçu pour protéger les investisseurs contre l'inflation et récompenser les détenteurs à long terme.",
      icon: Coins
    },
    {
      question: "Comment fonctionne le système de taxes progressives ?",
      answer: "Les taxes de vente diminuent avec le temps : 30% la première année, 15% après 2 ans, et 0% après 4 ans. Une taxe permanente de 10% s'applique à vie pour maintenir la stabilité du projet. 50% des taxes sont utilisées pour le buyback automatique.",
      icon: TrendingUp
    },
    {
      question: "Comment participer à l'ICO ?",
      answer: "Connectez votre wallet MetaMask, sélectionnez le round actif, entrez le montant en USD que vous souhaitez investir, et confirmez la transaction. Les tokens seront automatiquement crédités après vérification.",
      icon: Shield
    },
    {
      question: "Quels sont les montants minimum d'investissement ?",
      answer: "Round 1: $200 minimum, Round 2: $150 minimum, Round 3: $100 minimum, Round 4: $10 minimum. Ces montants garantissent un accès équitable tout en maintenant la qualité des investisseurs.",
      icon: DollarSign
    },
    {
      question: "Quand les tokens seront-ils disponibles ?",
      answer: "Les tokens sont crédités immédiatement après la vérification de votre transaction sur la blockchain. Vous pouvez voir votre solde dans votre wallet connecté et dans l'historique des transactions.",
      icon: Clock
    },
    {
      question: "Le projet est-il sécurisé ?",
      answer: "Oui, DEFLAT INU utilise des smart contracts audités sur Ethereum. Toutes les transactions sont vérifiées sur la blockchain et les fonds sont sécurisés par la technologie blockchain décentralisée.",
      icon: Shield
    },
    {
      question: "Que se passe-t-il après l'ICO ?",
      answer: "Après l'ICO, DEFLAT INU sera listé sur les DEX (Uniswap, PancakeSwap), puis sur les exchanges centralisés. Le système de buyback automatique sera activé et les mécanismes déflationnistes entreront en vigueur.",
      icon: TrendingUp
    },
    {
      question: "Comment fonctionne le buyback automatique ?",
      answer: "50% des taxes collectées sont automatiquement utilisées pour racheter des tokens sur le marché et les brûler, réduisant ainsi l'offre totale et créant une pression haussière sur le prix.",
      icon: Coins
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            <span className="text-orange-500">FAQ</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Réponses aux questions les plus fréquentes sur DEFLAT INU
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {faqData.map((item, index) => {
            const IconComponent = item.icon
            const isOpen = openIndex === index
            
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl md:rounded-3xl transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 pr-2 sm:pr-4">
                      {item.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {isOpen && (
                  <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                    <div className="ml-13 sm:ml-16 md:ml-18">
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 border border-orange-200 shadow-xl">
            <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Vous avez d'autres questions ?
            </h3>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
              Notre équipe est là pour vous aider. N'hésitez pas à nous contacter.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a 
                href="mailto:contact@deflatinu.com"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Nous contacter
              </a>
              <a 
                href="https://discord.gg/YkMpHR65"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto border border-gray-300 hover:border-gray-400 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Rejoindre Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}