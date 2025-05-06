import React, { useState } from 'react';

const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "Cosa significa ribilanciare un portafoglio?",
      answer: "Ribilanciare un portafoglio significa riportare le percentuali dei vari asset alle allocazioni target originali. Nel tempo, a causa delle diverse performance degli asset, alcuni potrebbero diventare sovrapesati o sottopesati rispetto all'allocazione desiderata. Il ribilanciamento aiuta a mantenere il livello di rischio desiderato."
    },
    {
      question: "Perché dovrei ribilanciare il mio portafoglio?",
      answer: "Il ribilanciamento è importante per diversi motivi: mantiene il livello di rischio desiderato, applica automaticamente il principio 'compra basso, vendi alto', e aiuta a mantenere la disciplina negli investimenti evitando decisioni emotive. Inoltre, studi hanno dimostrato che un portafoglio ribilanciato regolarmente può offrire un miglior rapporto rischio/rendimento nel lungo termine."
    },
    {
      question: "Come scelgo tra vendere asset o aggiungere liquidità?",
      answer: "La scelta dipende da diversi fattori:\n- Vendita: preferibile se hai asset significativamente sovrapesati o se vuoi realizzare profitti. Considera però le implicazioni fiscali e i costi di transazione.\n- Aggiunta di liquidità: ideale se hai nuovi fondi da investire o se vuoi evitare di vendere posizioni esistenti. Permette anche di minimizzare l'impatto fiscale."
    },
    {
      question: "Quali costi devo considerare nel ribilanciamento?",
      answer: "I principali costi da considerare sono:\n- Commissioni di trading per acquisti e vendite\n- Spread bid-ask degli strumenti finanziari\n- Imposte su eventuali plusvalenze realizzate\n- Costi di cambio valuta per asset in valuta estera\nÈ importante bilanciare la frequenza di ribilanciamento con questi costi."
    },
    {
      question: "Come gestisco gli asset che non posso frazionare?",
      answer: "Per asset non frazionabili (come alcune azioni):\n- Arrotonda le quantità al numero intero più vicino\n- Considera ETF simili che permettono l'acquisto di frazioni\n- Accetta piccole deviazioni dall'allocazione target\n- Usa la liquidità aggiuntiva per minimizzare le differenze"
    },
    {
      question: "Quali sono le migliori pratiche per il ribilanciamento?",
      answer: "Alcune best practice includono:\n- Stabilire soglie di tolleranza (es. ±5% dall'allocazione target)\n- Ribilanciare con nuovi investimenti quando possibile\n- Documentare le ragioni di ogni ribilanciamento\n- Considerare il ribilanciamento come parte di una revisione periodica completa del portafoglio\n- Valutare l'impatto fiscale prima di procedere"
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Domande Frequenti</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-md"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleQuestion(index)}
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      openQuestion === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                <div
                  className={`px-6 transition-all duration-200 ease-in-out overflow-hidden ${
                    openQuestion === index ? 'max-h-96 pb-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 