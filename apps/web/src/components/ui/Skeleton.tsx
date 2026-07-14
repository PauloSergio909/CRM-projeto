interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-50">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + ((r + c) % 3) * 15}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
