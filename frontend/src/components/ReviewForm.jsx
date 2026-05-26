import React, { useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axiosInstance'

const ReviewForm = ({ productId, productName, onClose, onSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Pick a star rating'); return; }
        if (comment.trim().length < 10) { toast.error('Write at least 10 characters'); return; }

        setLoading(true);
        try {
            await api.post(`/reviews/product/${productId}`, { rating, comment: comment.trim() });
            toast.success('Review submitted');
            onSubmitted?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='border border-line bg-paper p-5 mt-3'>
            <p className='text-xs text-ink-soft tracking-wider mb-3'>REVIEWING — {productName}</p>

            <div className='flex gap-1 mb-4'>
                {[1,2,3,4,5].map((star) => (
                    <button
                        key={star}
                        type='button'
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className='text-2xl leading-none cursor-pointer focus:outline-none'
                        aria-label={`${star} stars`}
                    >
                        <span className={star <= (hoverRating || rating) ? 'text-mustard' : 'text-ink-soft/30'}>★</span>
                    </button>
                ))}
                {rating > 0 && <span className='ml-3 text-sm text-ink-soft self-center'>{rating} / 5</span>}
            </div>

            <form onSubmit={onSubmitHandler}>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder='How was the product? What stood out?'
                    className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'
                />
                <div className='flex gap-2 mt-3'>
                    <button type='submit' disabled={loading} className='bg-ink text-paper px-5 py-2 text-sm hover:bg-navy transition-colors disabled:opacity-50'>
                        {loading ? 'Submitting...' : 'Submit review'}
                    </button>
                    <button type='button' onClick={onClose} className='border border-line px-5 py-2 text-sm hover:bg-line transition-colors'>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm
