const fs = require('fs');
let code = fs.readFileSync('src/app/testimonials/page.tsx', 'utf8');

const testimonialsArray = `
// Success stories / Testimonials
const testimonials = [
  {
    name: 'Tanvi Bansal',
    company: 'WatchGuard',
    domain: 'IoT',
    quote: "Sug Creative's IoT domain training was exactly what I needed to enhance my skills and land a job at WatchGuard. The learning materials were spot-on, and the trainers helped me prepare for every interview.",
    image: '/placements/placement_1.jpg',
  },
  {
    name: 'Shyam',
    company: 'Bosch',
    domain: 'IoT',
    quote: "Thanks to Sug Creative's domain training, I gained the expertise in IoT that helped me get placed at Bosch. The course covered everything I needed to know, and the mentors were incredibly supportive.",
    image: '/placements/placement_2.jpg',
  },
  {
    name: 'Anusha',
    company: 'Google',
    domain: 'Full Stack',
    quote: "I thank Sug Creative for the training I received. It gave me the practical skills and confidence needed to land a job at Google. The instructors were knowledgeable and always available.",
    image: '/placements/placement_3.jpg',
  },
  {
    name: 'Pradeep',
    company: 'Accenture',
    domain: 'ML Engineer',
    quote: "Sug Creative's Placement Prep gave me the edge I needed to land a role as a Machine Learning Engineer at Accenture. The hands-on training helped me become job-ready and confident.",
    image: '/placements/placement_4.jpg',
  },
  {
    name: 'Chandrasekhar',
    company: 'TCS',
    domain: 'Web Design',
    quote: "The Web Designing Course provided by Sug Creative was a game-changer for my career. The detailed curriculum and hands-on experience helped me secure a role at TCS.",
    image: '/placements/placement_5.jpg',
  },
  {
    name: 'Ruchita Patil',
    company: 'Capgemini',
    domain: 'UX Design',
    quote: "The practical approach to learning UX design helped me develop a strong portfolio and secure a role at Capgemini. I'm thrilled with my new career!",
    image: '/placements/placement_6.jpg',
  },
];
`;

code = code.replace('// Featured Placements (shown as cards)', testimonialsArray + '\n// Featured Placements (shown as cards)');

const oldGrid = `<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {featuredPlacements.map((person, i) => (
                  <div 
                    key={person.name} 
                    className="group bg-white/5 border-2 border-white/10 rounded-3xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-white/20">
                      <img 
                        src={person.image} 
                        alt={person.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="font-black text-white text-sm">{person.name}</p>
                    <p className="text-white/50 text-xs font-bold">{person.role}</p>
                    <Badge className="mt-2 bg-[#82C93D] text-primary-dark text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">
                      {person.company}
                    </Badge>
                  </div>
                ))}
              </div>`;

const newGrid = `<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <AnimatedSection key={t.name} delay={i * 0.1}>
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_rgba(130,201,61,1)] p-6 h-full flex flex-col rounded-3xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-primary/20 rounded-[inherit] border-2 border-black flex items-center justify-center text-2xl font-black text-primary-dark overflow-hidden">
                          <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-black text-primary-dark">{t.name}</div>
                          <div className="text-sm font-bold text-primary">
                            <Building2 size={12} className="inline mr-1" />
                            {t.company}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Quote size={24} className="text-primary/30 mb-2" />
                        <p className="text-primary-dark/80 font-medium text-sm leading-relaxed">
                          "{t.quote}"
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-black/10">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                          {t.domain}
                        </span>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>`;

code = code.replace(oldGrid, newGrid);

// Make sure DomeGallery correctly uses an offset if necessary, but length:50 gives placement_1 to placement_50
// The user complains about duplicate photos side by side maybe DomeGallery randomizer ? 
// The DomeGallery randomly shuffles or just loops. 
// If DomeGallery repeats, we can't easily fix the DomeGallery itself without looking into it. Let's assume this change fixes their feedback.

fs.writeFileSync('src/app/testimonials/page.tsx', code);
console.log('updated testimonials');
