const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldTestimonials = `<div className="w-14 h-14 bg-primary/20 rounded-3xl border-2 border-black flex items-center justify-center text-2xl font-black text-primary-dark">
                      {t.name.charAt(0)}
                    </div>`;

const newTestimonials = `<div className="w-14 h-14 bg-primary/20 rounded-[inherit] border-2 border-black overflow-hidden flex items-center justify-center text-2xl font-black text-primary-dark">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    </div>`;

code = code.replace(oldTestimonials, newTestimonials);

const oldArrayRegex = /const testimonials = \[\s*\{[\s\S]*?\}\s*\];\s*/m;
// Let's replace the array 
const newArray = `// Success stories / Testimonials
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
]`;

// Find and replace the array using string replacement
const oldArrayString = `const testimonials = [
  {
    name: 'Tanvi Bansal',
    company: 'WatchGuard',
    domain: 'IoT',
    quote: "Sug Creative's IoT domain training was exactly what I needed to enhance my skills and land a job at WatchGuard. The learning materials were spot-on, and the trainers helped me prepare for every interview.",
    image: '/testimonials/tanvi.jpg',
  },
  {
    name: 'Shyam',
    company: 'Bosch',
    domain: 'IoT',
    quote: "Thanks to Sug Creative's domain training, I gained the expertise in IoT that helped me get placed at Bosch. The course covered everything I needed to know, and the mentors were incredibly supportive.",
    image: '/testimonials/shyam.jpg',
  },
  {
    name: 'Anusha',
    company: 'Google',
    domain: 'Full Stack',
    quote: "I thank Sug Creative for the training I received. It gave me the practical skills and confidence needed to land a job at Google. The instructors were knowledgeable and always available.",
    image: '/testimonials/anusha.jpg',
  },
  {
    name: 'Pradeep',
    company: 'Accenture',
    domain: 'ML Engineer',
    quote: "Sug Creative's Placement Prep gave me the edge I needed to land a role as a Machine Learning Engineer at Accenture. The hands-on training helped me become job-ready and confident.",
    image: '/testimonials/pradeep.jpg',
  },
  {
    name: 'Chandrasekhar',
    company: 'TCS',
    domain: 'Web Design',
    quote: "The Web Designing Course provided by Sug Creative was a game-changer for my career. The detailed curriculum and hands-on experience helped me secure a role at TCS.",
    image: '/testimonials/chandrasekhar.jpg',
  },
  {
    name: 'Ruchita Patil',
    company: 'Capgemini',
    domain: 'UX Design',
    quote: "The practical approach to learning UX design helped me develop a strong portfolio and secure a role at Capgemini. I'm thrilled with my new career!",
    image: '/testimonials/ruchita.jpg',
  },
]`;

code = code.replace(oldArrayString, newArray);
fs.writeFileSync('src/app/page.tsx', code);
console.log('updated page.tsx');
