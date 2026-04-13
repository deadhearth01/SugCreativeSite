const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldLink = `<Link href={course.href} className={\`group block relative h-[560px] border-2 border-primary-dark rounded-3xl overflow-hidden \${colors.shadow} transition-all duration-500 hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white focus:outline-none\`}>
                    <div className="absolute inset-0">
                      <div className={\`absolute inset-0 bg-gradient-to-br \${colors.gradient} opacity-80 mix-blend-multiply z-10\`} />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
                    
                    {/* Background Image */}
                    <Image src={course.image} alt={course.title} fill className="object-cover z-0" />

                    {/* Icon & Duration Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                      <div className={\`w-14 h-14 \${colors.bg} rounded-2xl border-2 border-black flex items-center justify-center text-white\`}>
                        <IconComponent size={28} />
                      </div>
                      <div className="bg-white text-primary-dark font-black text-[10px] uppercase rounded-2xl tracking-widest px-3 py-1.5 border-2 border-black text-center">
                        3 Months
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end z-20">`;

const newLink = `<Link href={course.href} className={\`group block relative h-[560px] border-2 border-primary-dark rounded-3xl overflow-hidden \${colors.shadow} transition-all duration-500 hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] bg-white focus:outline-none\`}>
                    
                    {/* Background Image - MUST BE BASE LAYER */}
                    <div className="absolute inset-0 z-0">
                      <Image src={course.image} alt={course.title} fill className="object-cover" />
                    </div>

                    {/* Colored overlay */}
                    <div className={\`absolute inset-0 bg-gradient-to-br \${colors.gradient} opacity-80 mix-blend-multiply z-10 pointer-events-none\`} />
                    
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/80 to-transparent z-20 pointer-events-none" />

                    {/* Icon & Duration Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-30 pointer-events-none">
                      <div className={\`w-14 h-14 \${colors.bg} rounded-2xl border-2 border-black flex items-center justify-center text-white\`}>
                        <IconComponent size={28} />
                      </div>
                      <div className="bg-white text-primary-dark font-black text-[10px] uppercase rounded-2xl tracking-widest px-3 py-1.5 border-2 border-black text-center">
                        3 Months
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end z-30 pointer-events-none">`;

if (code.includes('                    <div className="absolute inset-0">')) {
  code = code.replace(oldLink, newLink);
  fs.writeFileSync('src/app/page.tsx', code);
  console.log("Updated course cards display!");
} else {
  console.log("Could not find literal string to replace!");
}
