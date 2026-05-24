const ProductCardSkeleton = () => {

    return (
        <div className="animate-pulse">

            <div className="bg-line aspect-[3/4] w-full" />

            <div className="mt-3 h-4 bg-line rounded w-3/4" />

            <div className="mt-2 h-3 bg-line rounded w-1/2" />

            <div className="mt-2 h-4 bg-line rounded w-1/4" />

        </div>
    );
};

export default ProductCardSkeleton;