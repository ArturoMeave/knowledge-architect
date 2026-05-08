export default function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="p-6 bg-white border border-blueprint-grid rounded-lg shadow-sm hover:border-blueprint-blue transition-colors group">
      <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-md mb-4 text-blueprint-blue group-hover:bg-blueprint-blue group-hover:text-white transition-all">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}