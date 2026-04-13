const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Ensure DomeGallery is imported
if (!code.includes('DomeGallery')) {
  code = code.replace("import AnimatedSection from '@/components/AnimatedSection'", 
`import AnimatedSection from '@/components/AnimatedSection'
import { DomeGallery } from '@/components/DomeGallery'`);
}

// 2. Add placementImages array if missing
if (!code.includes('const placementImages')) {
  code = code.replace("const companyLogos =", 
`const placementImages = Array.from({ length: 50 }, (_, i) => ({
  src: \`/placements/placement_\${i + 1}.jpg\`,
  alt: \`SUG member placed at top company\`
}))

const companyLogos =`);
}

// 3. Replace the Testimonials Grid with DomeGallery
const oldTestimonialsGrid = `{/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <div className="bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_rgba(130,201,61,1)] p-6 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/20 rounded-[inherit] border-2 border-black overflow-hidden flex items-center justify-center text-2xl font-black text-primary-dark">
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

const newTestimonialsGrid = `{/* Dome Gallery placement scroll */}
          {/* Edge-to-edge Dome Gallery Container - spans full viewport width */}
          <div className="relative w-screen left-1/2 -translate-x-1/2 h-[500px] md:h-[600px] lg:h-[700px]">
            <DomeGallery
              images={placementImages}
              fit={0.9}
              minRadius={500}
              maxVerticalRotationDeg={8}
              segments={10}
              dragDampening={1.8}
              grayscale={false}
              overlayBlurColor="#1A9AB5"
              imageBorderRadius="12px"
              openedImageBorderRadius="20px"
              openedImageWidth="280px"
              openedImageHeight="360px"
            />
          </div>
          
          <div className="text-center mt-12">
            <Link href="/testimonials">
              <Button size="lg" className="bg-[#82C93D] hover:bg-[#82C93D]/90 text-white rounded-full px-8 py-6 text-lg font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black transition-all hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                View All Success Stories <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>`;

code = code.replace(oldTestimonialsGrid, newTestimonialsGrid);

fs.writeFileSync('src/app/page.tsx', code);
console.log("Updated home page to include DomeGallery!");
