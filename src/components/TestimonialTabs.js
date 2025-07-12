import { useState } from "react";

const testimonials = {
  Celestia: {
    name: "Ismail Khoffi, Celestia",
    quote: "SkillMate made it easy to find the right people to learn from and teach.",
    logo: "/logos/celestia.svg"
  },
  dYdX: {
    name: "dYdX Team",
    quote: "The swap system is seamless and the community is amazing!",
    logo: "/logos/dydx.svg"
  },
  Osmosis: {
    name: "Osmosis Team",
    quote: "We love the flexibility and the focus on real skills.",
    logo: "/logos/osmosis.svg"
  }
};

export function TestimonialTabs() {
  const [active, setActive] = useState("Celestia");
  const data = testimonials[active];

  return (
    <section className="py-20 bg-gradient-to-br from-black to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <h2 className="text-3xl font-bold text-center">The stack trusted by builders</h2>
        {/* Tab Buttons */}
        <div className="flex justify-center gap-4">
          {Object.keys(testimonials).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-2 rounded-full font-medium ${
                active === key 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Testimonial Card */}
        <div className="bg-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-lg italic">“{data.quote}”</p>
            <p className="mt-4 font-semibold">{data.name}</p>
          </div>
          <div>
            <img src={data.logo} alt={active} className="h-16"/>
          </div>
        </div>
      </div>
    </section>
  );
} 