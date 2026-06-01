// components/StarRating.jsx
export default function StarRating({ value = 0, readOnly = false, onChange, size = 'md' }) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' };
  return (
    <div className="flex gap-0.5" role={readOnly ? 'img' : 'group'} aria-label={`${value} sao`}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n} type="button" disabled={readOnly}
          onClick={() => !readOnly && onChange?.(n)}
          className={`${sizes[size]} leading-none transition-transform
            ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}
            ${n <= value ? 'text-accent' : 'text-border'}`}
        >★</button>
      ))}
    </div>
  );
}
