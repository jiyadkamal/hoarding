'use client';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'heading' | 'circle' | 'rect' | 'card';
    width?: string | number;
    height?: string | number;
    size?: number;  // For circle variant convenience
    count?: number;
}


export const Skeleton = ({
    className = '',
    variant = 'rect',
    width,
    height,
    size,
    count = 1,
}: SkeletonProps) => {
    const variantStyles: Record<string, string> = {
        text: 'h-4 rounded-md',
        heading: 'h-6 rounded-md',
        circle: 'rounded-full',
        rect: 'rounded-[var(--radius-md)]',
        card: 'rounded-[var(--radius-lg)] h-48',
    };

    const baseStyles = `
    bg-gradient-to-r from-[var(--bg-tertiary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]
    bg-[length:200%_100%]
    animate-[shimmer_1.5s_infinite]
    ${variantStyles[variant]}
    ${className}
  `;

    const style: React.CSSProperties = {
        width: size ? `${size}px` : (typeof width === 'number' ? `${width}px` : width),
        height: size ? `${size}px` : (typeof height === 'number' ? `${height}px` : height),
    };

    if (count === 1) {
        return <div className={baseStyles} style={style} />;
    }

    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={baseStyles}
                    style={{
                        ...style,
                        width: index === count - 1 && variant === 'text' ? '70%' : style.width,
                    }}
                />
            ))}
        </div>
    );
};

// Skeleton Card for Hoardings
export const HoardingCardSkeleton = () => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[var(--radius-lg)] overflow-hidden">
        <Skeleton variant="rect" height={200} className="w-full" />
        <div className="p-5">
            <Skeleton variant="heading" className="w-3/4 mb-3" />
            <Skeleton variant="text" className="w-1/2 mb-4" />
            <div className="flex gap-2 mb-4">
                <Skeleton variant="rect" width={60} height={24} />
                <Skeleton variant="rect" width={80} height={24} />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-light)]">
                <Skeleton variant="text" width={100} />
                <Skeleton variant="rect" width={100} height={36} />
            </div>
        </div>
    </div>
);

// Skeleton Table Row
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
    <tr className="border-b border-[var(--border-light)]">
        {Array.from({ length: columns }).map((_, index) => (
            <td key={index} className="p-4">
                <Skeleton variant="text" className="w-full" />
            </td>
        ))}
    </tr>
);

// Skeleton Stats Card
export const StatsCardSkeleton = () => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center gap-4">
            <Skeleton variant="circle" width={48} height={48} />
            <div className="flex-1">
                <Skeleton variant="text" className="w-20 mb-2" />
                <Skeleton variant="heading" className="w-16" />
            </div>
        </div>
    </div>
);

// Skeleton for Booking Details
export const BookingDetailsSkeleton = () => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[var(--radius-lg)] p-6">
        <div className="flex gap-6">
            <Skeleton variant="rect" width={300} height={200} />
            <div className="flex-1 space-y-4">
                <Skeleton variant="heading" className="w-2/3" />
                <Skeleton variant="text" count={3} />
                <div className="flex gap-4 pt-4">
                    <Skeleton variant="rect" width={120} height={40} />
                    <Skeleton variant="rect" width={120} height={40} />
                </div>
            </div>
        </div>
    </div>
);

export default Skeleton;
