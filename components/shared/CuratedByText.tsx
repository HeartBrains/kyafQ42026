interface CuratedByTextProps {
  curator: string;
  label: string;
  className: string;
}

export function CuratedByText({ curator, label, className }: CuratedByTextProps) {
  const names = curator.split(',').map((name) => name.trim()).filter(Boolean);

  if (names.length === 0) return null;

  return (
    <p className={className}>
      <span className="block">{label}</span>
      {names.map((name, index) => (
        <span className="block" key={`${index}-${name}`}>
          {name}
        </span>
      ))}
    </p>
  );
}
