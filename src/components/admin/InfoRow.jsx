function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 text-gray-800">
      <span>{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default InfoRow;
