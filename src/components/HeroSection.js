import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-br from-[#0f0f23] to-black py-24">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <span className="inline-block bg-indigo-700 text-xs uppercase tracking-widest rounded-full px-3 py-1">
            New
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl"
          >
            Swap Skills, Build Together
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-lg text-gray-300 max-w-lg mx-auto md:mx-0"
          >
            Connect. Learn. Grow. Offer and request skills from real people. SkillMate is your gateway to a world of collaborative learning and growth.
          </motion.p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition">
              Browse Skills
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-xl hover:bg-white/10 transition">
              Post Your Profile
            </button>
          </div>
          <div className="flex gap-2 mt-4 justify-center md:justify-start">
            <button className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-600 transition">Weekends</button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-600 transition">Evenings</button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-600 transition">Mornings</button>
          </div>
        </div>
        {/* Right Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex-1 flex justify-center"
        >
          <img
            src="/assets/skillmate-illustration.svg"
            alt="SkillMate Illustration"
            className="w-full max-w-md object-contain drop-shadow-2xl"
            onError={(e) => {
              e.currentTarget.src = 'https://undraw.co/api/illustrations/illustration.svg';
            }}
          />
        </motion.div>
      </div>
    </section>
  );
} 