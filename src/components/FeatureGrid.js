import { ArrowUpRight } from "lucide-react";

const features = [
  {
    title: "Skill Matching",
    desc: "Find the perfect match for your learning or teaching goals.",
    icon: <span className="text-2xl">🔗</span>,
  },
  {
    title: "Verified Profiles",
    desc: "Trust and safety with verified user profiles.",
    icon: <span className="text-2xl">✅</span>,
  },
  {
    title: "Real-time Chat",
    desc: "Connect instantly with your swap partners.",
    icon: <span className="text-2xl">💬</span>,
  },
  {
    title: "Flexible Availability",
    desc: "Swap skills on your schedule: weekends, evenings, or mornings.",
    icon: <span className="text-2xl">⏰</span>,
  },
  {
    title: "Admin Moderation",
    desc: "Safe, fair, and friendly community with active moderation.",
    icon: <span className="text-2xl">🛡️</span>,
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-black text-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Feature Items */}
          <div className="space-y-8">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{f.title}{" "}
                    <ArrowUpRight className="inline-block w-4 h-4" />
                  </h3>
                  <p className="text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Right: Heading + CTA */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Design to spec, at internet scale
            </h2>
            <p className="mt-4 text-gray-300">
              Customize your skill swap experience from your profile to your connections. You control your learning and teaching journey.
            </p>
            <button className="mt-6 bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition">
              Get started with SkillMate ↗
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 