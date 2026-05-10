import { motion } from "motion/react";
import { Menu, X, Clock, Calendar, Maximize2, Users, Award, Camera } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden" style={{ maxWidth: "100%", width: "100%" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight cursor-pointer"
            onClick={() => navigate("/")}
          >
            Lu<span className="text-[#00F9E4]">Te</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#espaco" className="text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Espaço</a>
            <a href="#programas" className="text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Programas</a>
            <a href="#equipe" className="text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Equipe</a>
            <a href="#planos" className="text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Planos</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 text-sm border border-[#2A2A2A] hover:border-[#00F9E4] transition-colors rounded-full"
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => navigate("/agendar-visita")}
              className="px-5 py-2 text-sm bg-[#00F9E4] text-[#0A0A0A] hover:bg-[#33FFEE] transition-colors rounded-full"
            >
              AGENDAR VISITA
            </button>
          </div>

          <button
            className="md:hidden text-[#00F9E4]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-[#2A2A2A] bg-[#121212] px-6 py-6"
          >
            {(
              [
                ["#espaco", "Espaço"],
                ["#programas", "Programas"],
                ["#equipe", "Equipe"],
                ["#planos", "Planos"],
              ] as const
            ).map(([href, label], idx) => (
              <a
                key={href}
                href={href}
                className={`block text-xl text-[#9A9A9A] text-center pt-5 pb-6 hover:text-[#00F9E4] transition-colors${idx < 3 ? " border-b border-[#2A2A2A]" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-6 border-t border-[#2A2A2A]">
              <button
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                className="w-full py-4 text-sm border border-[#2A2A2A] rounded-full"
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => { navigate("/agendar-visita"); setMenuOpen(false); }}
                className="w-full py-4 text-sm bg-[#00F9E4] text-[#0A0A0A] rounded-full"
              >
                AGENDAR VISITA
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 md:px-6 min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover grayscale opacity-40"
          >
            <source src="https://lucineiatenorio.com.br/videos/Muscular_person_turns.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#0A0A0A]/10 to-[#0A0A0A]/70" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00F9E4] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 border border-[#2A2A2A] text-[10px] md:text-xs text-[#9A9A9A] mb-6 md:mb-8 rounded-full"
          >
            <span className="w-2 h-2 bg-[#00F9E4] rounded-full animate-pulse" />
            <span className="whitespace-nowrap">Beyond Limits Known · Indaiatuba, SP · Est. 2018</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-8"
          >
            <h1 className="text-[42px] md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] uppercase">
              SEM MÁGICA<br />
              SEM ATALHOS<br />
              SEM <span className="text-[#00F9E4]">DESCULPAS</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#CFCFCF] text-sm md:text-base max-w-2xl mb-8 md:mb-12 leading-relaxed"
          >
            Treinos progressivos e acompanhamento real! Um espaço desenhado para quem treina com intenção.
            Sem distrações. Sem promessas vazias. Só você, o equipamento e o trabalho.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-12 md:mb-20"
          >
            <a
              href="#planos"
              className="inline-flex justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-base bg-[#00F9E4] text-[#0A0A0A] hover:bg-[#33FFEE] transition-all hover:shadow-[0_0_30px_rgba(0,249,228,0.3)] rounded-full font-bold uppercase tracking-wider"
            >
              COMEÇAR AGORA
            </a>
            <a
              href="#espaco"
              className="inline-flex justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-base border border-[#2A2A2A] hover:border-[#00F9E4] transition-colors rounded-full uppercase tracking-wider"
            >
              CONHECER O ESPAÇO
            </a>
            <button
              type="button"
              onClick={() => navigate("/agendar-visita")}
              className="px-6 md:px-8 py-3 md:py-4 text-sm md:text-base border border-[#2A2A2A] hover:border-[#00F9E4] hover:text-[#00F9E4] transition-colors rounded-full uppercase tracking-wider"
            >
              Agendar visita guiada
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8"
          >
            {[
              { icon: Clock, label: "HORÁRIO", value: "05H — 23H" },
              { icon: Calendar, label: "DIAS", value: "7 DIAS" },
              { icon: Maximize2, label: "ÁREA", value: "1.800M²" },
              { icon: Users, label: "ALUNOS", value: "+1.200" },
              { icon: Award, label: "FUNDAÇÃO", value: "DESDE 2018" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="space-y-3 flex flex-col items-center text-center md:items-start md:text-left"
              >
                <item.icon className="w-6 h-6 text-[#00F9E4]" />
                <div className="text-xs text-[#9A9A9A]">{item.label}</div>
                <div className="font-bold">{item.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quem Somos */}
      <section id="espaco" className="py-16 md:py-24 px-6 md:px-6 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-16"
          >
            <h2 className="text-[42px] md:text-4xl lg:text-6xl font-bold mb-6 md:mb-8 uppercase text-center md:text-left leading-tight">
              FORJADOS PELA <span className="text-[#00F9E4]">DISCIPLINA.</span>
            </h2>
            <p className="text-[#CFCFCF] max-w-3xl mb-6 md:mb-8 text-base md:text-lg leading-relaxed text-center md:text-left mx-auto md:mx-0">
              A LuTe nasceu de uma certeza simples: ambiente mediano produz resultado mediano.
              Cada metro quadrado foi pensado para que o espaço não interfira — ele desaparece.
              O que fica é o treino, a concentração e o progresso.
            </p>
            <p className="text-[#9A9A9A] italic mb-6 md:mb-8 text-base md:text-lg text-center md:text-left">
              "In silence, the transformation begins."
            </p>
            <p className="text-[#CFCFCF] text-sm md:text-base max-w-3xl leading-relaxed text-center md:text-left mx-auto md:mx-0">
              Aqui não tem música forçada, espelho em excesso ou coach em cima. Tem equipamento que não decepciona
              no seu melhor dia, profissionais que aparecem quando você precisa e silêncio o suficiente para se ouvir.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16">
            {[
              { number: "01", title: "Intensidade", desc: "O ambiente foi calibrado para elevar. Iluminação, acústica, temperatura — tudo serve ao treino." },
              { number: "02", title: "Precisão", desc: "Protocolo individualizado desde o dia um. Nenhuma planilha genérica sai daqui." },
              { number: "03", title: "Controle", desc: "Você define o objetivo. Nós fornecemos o caminho, o espaço e o suporte." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#00F9E4] transition-colors rounded-[16px]"
              >
                <div className="text-[#00F9E4] text-4xl font-bold mb-4">{item.number}</div>
                <h3 className="text-xl font-bold mb-4 uppercase">{item.title}</h3>
                <p className="text-[#9A9A9A] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "+1.200", label: "Alunos ativos" },
              { value: "94%", label: "Retenção 6 meses" },
              { value: "8 anos", label: "Em operação" },
              { value: "1.8K M²", label: "Dedicados" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 border border-[#2A2A2A] rounded-[16px]"
              >
                <div className="text-3xl md:text-5xl font-bold text-[#00F9E4] mb-2">{stat.value}</div>
                <div className="text-sm text-[#9A9A9A]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 md:py-24 px-6 md:px-6 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-16 uppercase text-center md:text-left"
          >
            O QUE <span className="text-[#00F9E4]">DIZEM</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { name: "Rafael M.", role: "Engenheiro · Aluno há 3 anos", quote: "Treinei em academias em São Paulo por anos. A LuTe é a única que me fez não sentir falta de nenhuma delas." },
              { name: "Juliana T.", role: "Professora · Aluna há 2 anos", quote: "Entrei querendo perder peso. Fiquei pela comunidade e pela sensação de que alguém realmente acompanha." },
              { name: "Lucas O.", role: "Empresário · Aluno há 4 anos", quote: "A estrutura impressiona. Mas o que me mantém são os profissionais. Nunca fui tão bem orientado." }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 bg-[#121212] border border-[#2A2A2A] rounded-[16px]"
              >
                <p className="text-[#CFCFCF] mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="border-t border-[#2A2A2A] pt-4">
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-[#9A9A9A]">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Estrutura */}
      <section className="py-16 md:py-20 px-6 md:px-12 lg:px-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#333] bg-[#111] mb-4 rounded-full">
                <span className="w-2 h-2 bg-[#00e5cc] rounded-full" />
                <span className="text-white text-[11px] uppercase tracking-widest">ESTRUTURA</span>
              </div>
              <h2 className="text-[42px] lg:text-6xl font-black uppercase leading-none mb-4 text-white text-center md:text-left tracking-tight">
                EQUIPAMENTO QUE NÃO TE LIMITA.
              </h2>
              <p className="text-[#aaaaaa] text-sm mb-8 leading-relaxed text-center md:text-left">
                Cada peça selecionada com um critério: aguentar seu melhor dia — todos os dias.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-3">
                <div className="sm:row-span-2 overflow-hidden rounded-[16px] h-[300px] sm:h-auto">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1590239926044-4131f5d0654d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt="Dumbbells rack"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-[16px]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1758521959675-5874879f3977?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt="Pull-up bar workout"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105"
                  />
                </div>
                <div className="aspect-square bg-[#111] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                  <Camera className="w-6 h-6 text-[#666]" strokeWidth={1.5} />
                  <span className="text-[#666] text-[11px] uppercase tracking-widest text-center px-4">
                    VER GALERIA COMPLETA
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 md:space-y-8"
            >
              {[
                { number: "01", title: "CARDIO & CONDITIONING", desc: "Assault Bike Concept2 (8 un), Remo Concept2 Model D (6 un), SkiErg Concept2 (4 un), Esteiras NordicTrack, Cordas de batalha." },
                { number: "02", title: "FORÇA LIVRE", desc: "Plataformas de LPO Eleiko, Racks Rogue, Halteres calibrados até 60kg, Anilhas olímpicas bumper." },
                { number: "03", title: "MÁQUINAS", desc: "Seleção premium com biomecânica avançada para isolamento e hipertrofia focada." },
                { number: "04", title: "FUNCIONAL & MOBILITY", desc: "Área de grama sintética, caixas pliométricas, kettlebells de competição, acessórios de mobilidade." },
                { number: "05", title: "INFRAESTRUTURA", desc: "Vestiários climatizados, armários rotativos, lounges de descompressão, Wi-Fi de alta velocidade." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="pb-8 border-b border-[#222] last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-[#555] text-xs font-mono mt-1">{item.number}</span>
                    <div className="flex-1">
                      <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-2">{item.title}</h3>
                      <p className="text-[#aaa] text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programas */}
      <section id="programas" className="py-16 md:py-24 px-6 md:px-6 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-6xl font-bold mb-12 md:mb-16 uppercase text-center md:text-left"
          >
            UM PROTOCOLO PARA CADA <span className="text-[#00F9E4]">OBJETIVO.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              { title: "LuTe STRENGTH", desc: "Musculação por periodização. Para iniciantes a avançados em hipertrofia.", frequency: "3 a 5× por semana", featured: false },
              { title: "LuTe CONDITIONING", desc: "Sessões de 45 min de alta intensidade.", frequency: "Horários: 06H · 07H · 12H · 18H · 19H30", featured: false },
              { title: "LuTe MOBILITY", desc: "Foco em postura e prevenção de lesões para quem treina pesado.", frequency: "2× por semana", featured: false },
              { title: "PERSONAL TRAINING", desc: "Sessões 1:1 com avaliação completa e revisão mensal.", frequency: "Sob demanda", featured: false }
            ].map((program, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 md:p-8 border ${program.featured ? 'bg-[#1C1C1C] border-[#00F9E4]' : 'bg-[#121212] border-[#2A2A2A]'} hover:border-[#00F9E4] transition-colors rounded-[16px]`}
              >
                <h3 className="text-2xl font-bold mb-4 uppercase">{program.title}</h3>
                <p className="text-[#CFCFCF] mb-4 leading-relaxed">{program.desc}</p>
                <p className="text-sm text-[#9A9A9A]">{program.frequency}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-16 md:py-24 px-6 md:px-6 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-16"
          >
            <h2 className="text-[42px] md:text-4xl lg:text-6xl font-bold mb-4 uppercase text-center md:text-left leading-tight tracking-tight">
              SEM MATRÍCULA. SEM FIDELIDADE. <span className="text-[#00F9E4]">SEM ENROLAÇÃO.</span>
            </h2>
            <p className="text-[#9A9A9A] text-lg text-center md:text-left">Mude de plano quando quiser. Cancele com 30 dias.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {[
              { name: "LIVRE", price: "R$149", period: "/mês", benefits: ["Acesso ilimitado (05H-23H)", "Avaliação de entrada", "Planilha inicial"], featured: false },
              { name: "PLUS", price: "R$229", period: "/mês", benefits: ["Tudo do Livre", "2 sessões Personal/mês", "1 aula Conditioning/semana"], featured: true },
              { name: "ELITE", price: "R$389", period: "/mês", benefits: ["Tudo do Plus", "4 sessões Personal/mês", "Acesso ilimitado classes", "Bioimpedância"], featured: false }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 md:p-8 border ${plan.featured ? 'bg-[#1C1C1C] border-[#00F9E4] md:scale-105' : 'bg-[#121212] border-[#2A2A2A]'} rounded-[16px]`}
              >
                <h3 className="text-2xl font-bold mb-6 uppercase">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-[#00F9E4]">{plan.price}</span>
                  <span className="text-[#9A9A9A]">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.benefits.map((benefit, j) => (
                    <li key={j} className="text-[#CFCFCF] flex items-start gap-2">
                      <span className="text-[#00F9E4] mt-1">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-full font-bold uppercase tracking-wider ${plan.featured ? 'bg-[#00F9E4] text-[#0A0A0A]' : 'border border-[#2A2A2A]'} hover:bg-[#00F9E4] hover:text-[#0A0A0A] transition-colors`}>
                  COMEÇAR AGORA
                </button>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-2"
          >
            <p className="text-[#9A9A9A]">PIX ou Cartão (3x sem juros). Plano anual: 15% OFF.</p>
            <p className="text-[#CFCFCF]">Diária: <span className="text-[#00F9E4] font-bold">R$39</span> (Acesso por 1 dia)</p>
          </motion.div>
        </div>
      </section>

      {/* Equipe */}
      <section id="equipe" className="py-16 md:py-20 px-6 md:px-12 lg:px-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto flex flex-col items-center md:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#333] bg-[#111] mb-4 rounded-full"
          >
            <span className="w-2 h-2 bg-[#00e5cc] rounded-full" />
            <span className="text-white text-[11px] uppercase tracking-widest">A EQUIPE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[42px] md:text-5xl lg:text-6xl font-black uppercase leading-none mb-4 text-white text-center md:text-left"
          >
            COACHES QUE TREINAM.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#aaaaaa] text-sm max-w-[420px] mb-12 leading-relaxed text-center md:text-left mx-auto md:mx-0"
          >
            A teoria é fundamental, mas o respeito é conquistado na prática. Nossa equipe vive o que ensina.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[
              { name: "RODRIGO FARIAS", role: "HEAD COACH", image: "https://images.unsplash.com/photo-1758875569897-5e214ccc4e17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
              { name: "ANA LUÍSA", role: "CONDITIONING", image: "https://images.unsplash.com/photo-1618168220187-ef594ca55286?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
              { name: "BRUNO T.", role: "MOBILITY & REHAB", image: "https://images.unsplash.com/photo-1754475118668-64ac3f3b2559?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
              { name: "CAMILA D.", role: "PERSONAL TRAINER", image: "https://images.unsplash.com/photo-1758875568800-29fb434c7b17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" }
            ].map((coach, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111] rounded-[16px] overflow-hidden h-[290px] relative group"
              >
                <div className="relative h-[85%] overflow-hidden">
                  <ImageWithFallback
                    src={coach.image}
                    alt={coach.name}
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] px-4 py-3">
                  <h3 className="text-white text-[13px] font-bold uppercase tracking-wider mb-1">{coach.name}</h3>
                  <p className="text-[#888] text-[10px] uppercase tracking-[1.5px]">{coach.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-6 md:px-6 bg-[#121212]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 md:mb-16 uppercase text-center md:text-left"
          >
            PERGUNTAS <span className="text-[#00F9E4]">DIRETAS</span>
          </motion.h2>

          <div className="space-y-6">
            {[
              { q: "Preciso ter experiência?", a: "Não. O ponto de partida é individual através da avaliação inicial." },
              { q: "Posso treinar sozinho?", a: "Sim, a maioria treina de forma autônoma com planilha e suporte pontual." },
              { q: "Como funciona o cancelamento?", a: "Aviso prévio de 30 dias. Sem multa." },
              { q: "Posso visitar antes?", a: "Sim, agende pelo site para uma visita e aula experimental gratuita." }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 md:p-6 bg-[#1C1C1C] border border-[#2A2A2A] rounded-[16px]"
              >
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-[#9A9A9A]">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-16 md:py-24 px-6 md:px-6 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 md:mb-16 uppercase text-center md:text-left"
          >
            ONDE ESTAMOS
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-[#00F9E4]">Endereço</h3>
                <p className="text-[#CFCFCF]">
                  Rua das Esmeraldas, 742 - Jd. Morada do Sol<br />
                  Indaiatuba, SP<br />
                  <span className="text-[#9A9A9A] text-sm">(Ref: 200m do Carrefour)</span>
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-[#00F9E4]">Horários de Funcionamento</h3>
                <div className="space-y-2 text-[#CFCFCF]">
                  <p>Segunda a Sexta: <span className="text-white">05H00 — 23H00</span></p>
                  <p>Sábado: <span className="text-white">07H00 — 20H00</span></p>
                  <p>Domingo e Feriados: <span className="text-white">08H00 — 14H00</span></p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-[#00F9E4]">Contato</h3>
              <div className="space-y-4 text-[#CFCFCF]">
                <p>WhatsApp: <span className="text-white">(19) 98234-5678</span></p>
                <p>E-mail: <span className="text-white">contato@lute.academy</span></p>
                <p>Instagram: <span className="text-white">@lute.academy</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32 px-6 md:px-6 bg-[#00F9E4] text-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 uppercase leading-tight"
          >
            A DECISÃO JÁ FOI TOMADA.<br />
            AGORA É A AÇÃO.
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="px-8 md:px-12 py-4 md:py-5 bg-[#0A0A0A] text-[#00F9E4] text-base md:text-lg font-bold hover:bg-[#121212] transition-colors rounded-full uppercase tracking-wider"
          >
            AGENDE UMA VISITA GRATUITA
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-6 md:px-6 bg-[#0A0A0A] border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            <div>
              <div className="text-3xl font-bold mb-2">
                Lu<span className="text-[#00F9E4]">Te</span>
              </div>
              <p className="text-[#9A9A9A] text-sm">BEYOND LIMITS KNOWN</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links</h4>
              <div className="space-y-2">
                <a href="#espaco" className="block text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Espaço</a>
                <a href="#programas" className="block text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Programas</a>
                <a href="#equipe" className="block text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Equipe</a>
                <a href="#planos" className="block text-sm text-[#9A9A9A] hover:text-[#00F9E4] transition-colors">Planos</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-[#9A9A9A]">
                <p>Política de Privacidade</p>
                <p>Termos de Uso</p>
                <p>CNPJ 00.000.000/0001-00</p>
                <p>CREF-SP</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-[#2A2A2A] text-center text-sm text-[#6B6B6B] space-y-1">
            <p>© 2026 LuTe Academy. Todos os direitos reservados.</p>
            <p style={{ fontSize: "11px", color: "#3A3A3A", fontFamily: "monospace", letterSpacing: "0.07em" }}>
              desenvolvido por <span style={{ color: "#555555", fontWeight: 700 }}>Lucineia Tenorio</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
