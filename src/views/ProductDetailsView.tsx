/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  Crown, 
  MessageSquare, 
  HelpCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { Product, Review, QA, User, UserRole } from '../lib/db';

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  currentUser: User;
  reviews: Review[];
  qas: QA[];
  onAddReview: (productId: string, rating: number, title: string, text: string) => void;
  onAddQuestion: (productId: string, question: string) => void;
  onAddAnswer: (qaId: string, answer: string) => void;
}

export default function ProductDetailsView({
  product,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  currentUser,
  reviews,
  qas,
  onAddReview,
  onAddQuestion,
  onAddAnswer,
}: ProductDetailsViewProps) {
  // Image Hover Zoom effect
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({ transform: 'scale(1)' });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.5)',
    });
  };
  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)' });
  };

  // Add Review Form state
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewTitle, setReviewTitle] = React.useState('');
  const [reviewText, setReviewText] = React.useState('');
  const [reviewSuccess, setReviewSuccess] = React.useState(false);

  // Real-time keyword sentiment heuristics (Feature #14)
  const computedSentiment = React.useMemo(() => {
    if (!reviewText.trim()) return null;
    const lower = reviewText.toLowerCase();
    const positiveWords = ['excellent', 'love', 'amazing', 'great', 'perfect', 'good', 'best', 'superb', 'delightful', 'gorgeous', 'bliss', 'magical', 'flawless', 'curated'];
    const negativeWords = ['bad', 'worst', 'hate', 'issue', 'poor', 'broken', 'disappointing', 'tight', 'heavy', 'stiff', 'sad', 'muddy', 'clunky', 'annoying'];
    
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    
    if (posCount > negCount) {
      return { label: 'Audit Result: Product Praise (Positive Sentiment)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (negCount > posCount) {
      return { label: 'Audit Result: Critical Friction (Negative Sentiment)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else {
      return { label: 'Audit Result: Neutral Balance (Neutral/Objective)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  }, [reviewText]);

  // Add Question state
  const [questionText, setQuestionText] = React.useState('');
  const [questionSuccess, setQuestionSuccess] = React.useState(false);

  // QA Answer boxes states
  const [answerTexts, setAnswerTexts] = React.useState<Record<string, string>>({});

  // State variables for review star-filter & Q&A search query
  const [selectedStarFilter, setSelectedStarFilter] = React.useState<number | null>(null);
  const [qaSearchQuery, setQaSearchQuery] = React.useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewText.trim()) return;
    onAddReview(product.id, reviewRating, reviewTitle, reviewText);
    setReviewTitle('');
    setReviewText('');
    setReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    onAddQuestion(product.id, questionText);
    setQuestionText('');
    setQuestionSuccess(true);
    setTimeout(() => setQuestionSuccess(false), 3000);
  };

  const handleAnswerSubmit = (qaId: string) => {
    const txt = answerTexts[qaId];
    if (!txt || !txt.trim()) return;
    onAddAnswer(qaId, txt);
    setAnswerTexts({ ...answerTexts, [qaId]: '' });
  };

  // Filter dynamic review records for the current product
  const rawProductReviews = reviews.filter((r) => r.productId === product.id);
  const productReviews = selectedStarFilter !== null
    ? rawProductReviews.filter((r) => r.rating === selectedStarFilter)
    : rawProductReviews;

  // Filter and search active product Q&As
  const rawProductQas = qas.filter((q) => q.productId === product.id);
  const productQas = qaSearchQuery.trim()
    ? rawProductQas.filter((qa) => 
        qa.question.toLowerCase().includes(qaSearchQuery.toLowerCase()) || 
        (qa.answer && qa.answer.toLowerCase().includes(qaSearchQuery.toLowerCase()))
      )
    : rawProductQas;

  // Dynamic pricing
  const finalPrice = product.isElite && currentUser.isElite 
    ? Math.round(product.price * 0.9) 
    : product.price;

  // Calculate percentages based on raw unfiltered reviews count
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const matchingCount = rawProductReviews.filter((r) => r.rating === stars).length;
    const pct = rawProductReviews.length > 0 ? (matchingCount / rawProductReviews.length) * 100 : 0;
    return { stars, count: matchingCount, pct };
  });

  return (
    <div id="product-details-container" className="pb-16 space-y-12 animate-fade-in">
      
      {/* Back button */}
      <button
        id="details-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 uppercase tracking-wider transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Listing</span>
      </button>

      {/* PRIMARY COLUMN GRID */}
      <div id="details-main-grid" className="grid gap-8 md:grid-cols-2">
        
        {/* LEFT: ZOOMABLE IMAGE WRAPPER */}
        <div id="details-image-card" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-4 flex flex-col justify-center">
          <div 
            id="zoom-image-frame"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 cursor-zoom-in"
          >
            <img
              id="details-product-img"
              src={product.image}
              alt={product.name}
              style={zoomStyle}
              className="h-full w-full object-cover transition-transform duration-100"
            />
            
            {product.isElite && (
              <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-amber-500/95 backdrop-blur-sm px-3 py-1.5 text-xs font-black text-white shadow-md">
                <Crown className="h-4 w-4" />
                <span>ELITE SELECTION</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-mono">
            Hover or slide cursor over image to zoom and inspect quality details
          </p>
        </div>

        {/* RIGHT: DETAILS CONTROLS */}
        <div id="details-controls-card" className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category and brand path */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest leading-none">
              <span>{product.brand}</span>
              <span>/</span>
              <span className="text-teal-600 font-bold">{product.category}</span>
            </div>

            {/* Title */}
            <h2 id="details-product-title" className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h2>

            {/* Rating overview */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({productReviews.length} Verified Reviewers)</span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Specs Specs list */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Specifications Log</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Manufacturer</span><span className="font-semibold text-slate-700">{product.brand}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Stock Available</span><span className={`font-semibold ${product.stock <= 3 ? 'text-red-500' : 'text-slate-700'}`}>{product.stock} units</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Category segment</span><span className="font-semibold text-slate-700">{product.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Merchant</span><span className="font-semibold text-teal-600">{product.sellerName}</span></div>
              </div>
            </div>
          </div>

          {/* Pricing Box & Call-To-Action */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-1">Pricing Ledger</span>
                {product.isElite && currentUser.isElite ? (
                  <div className="flex items-baseline gap-2">
                    <span id="details-price-tag" className="text-3xl font-black text-teal-600">${finalPrice}</span>
                    <span className="text-sm text-slate-400 line-through">${product.price}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">Elite 10% Discount applied!</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span id="details-price-tag" className="text-3xl font-black text-slate-800">${product.price}</span>
                    {product.isElite && !currentUser.isElite && (
                      <span className="text-[10px] text-amber-600 font-medium">Join Elite to save 10%!</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Logistics Class</span>
                <span className="text-xs font-bold text-slate-700">Priority Hub Delivery</span>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Wishlist Button */}
              <button
                id="details-wishlist-toggle"
                onClick={() => onToggleWishlist(product)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                  isWishlisted 
                    ? 'border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100' 
                    : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Add to Cart Button */}
              <button
                id="details-add-to-cart-btn"
                onClick={() => onAddToCart(product)}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                  product.stock > 0
                    ? 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{product.stock > 0 ? 'Commit to Cart' : 'Currently Out of Stock'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* DISCUSSIONS & REVIEWS DUAL TABS */}
      <div id="details-discussions-grid" className="grid gap-8 lg:grid-cols-12 border-t border-slate-100 pt-10">
        
        {/* REVIEWS SEGMENT (left 7 cols) */}
        <section id="details-reviews-panel" className="lg:col-span-7 space-y-6">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Verified Buyer Review Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sourced from decentralized audit-validated purchases</p>
          </div>

          {/* Rating aggregate panel */}
          <div className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-slate-100 p-5 bg-white shadow-sm">
            <div className="text-center sm:border-r sm:border-slate-100 sm:pr-8 flex flex-col justify-center">
              <span className="text-5xl font-black text-slate-800 tracking-tight">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Out of 5</span>
              <div className="flex justify-center text-amber-400 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}`} />
                ))}
              </div>
            </div>

            {/* Progress Bars (Interactive for Star Filtering) */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map((tier) => {
                const isSelected = selectedStarFilter === tier.stars;
                return (
                  <button
                    id={`filter-star-tier-${tier.stars}`}
                    key={tier.stars}
                    onClick={() => setSelectedStarFilter(isSelected ? null : tier.stars)}
                    className={`w-full flex items-center gap-3 text-xs transition-all p-1.5 rounded-xl cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-50/70 border border-amber-200 shadow-xs scale-102' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                    title={`Click to filter by ${tier.stars} stars`}
                  >
                    <span className="font-mono text-slate-400 w-3 text-left">{tier.stars}</span>
                    <Star className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-500 fill-amber-500' : 'text-amber-400 fill-current'}`} />
                    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${tier.pct}%` }}></div>
                    </div>
                    <span className="font-mono text-slate-400 w-5 text-right font-semibold">{tier.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Star Filter Indicator */}
          {selectedStarFilter !== null && (
            <div id="active-star-filter-indicator" className="flex items-center justify-between bg-amber-50/75 border border-amber-200 rounded-xl p-3 text-xs animate-fade-in shadow-xs">
              <span className="text-amber-900 font-medium">
                Showing only <strong>{selectedStarFilter}-Star</strong> reviews
              </span>
              <button
                id="reset-star-filter-btn"
                onClick={() => setSelectedStarFilter(null)}
                className="text-[10px] font-bold text-amber-700 bg-white border border-amber-200 rounded-lg px-2.5 py-1 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* List of Reviews */}
          <div className="space-y-4">
            {productReviews.length > 0 ? (
              productReviews.map((rev) => (
                <div id={`review-item-${rev.id}`} key={rev.id} className="rounded-2xl border border-slate-50 bg-white/50 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <UserCheck className="h-2.5 w-2.5" />
                        <span>Verified Buyer</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                  </div>

                  <div className="flex items-center text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-100'}`} />
                    ))}
                  </div>

                  <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{rev.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No reviews submitted yet. Be the first to audit-validate this listing.</p>
            )}
          </div>

          {/* Create Review Form */}
          <form id="add-review-form" onSubmit={handleReviewSubmit} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Publish Client Evaluation</h4>
            
            {reviewSuccess && (
              <div id="review-success-banner" className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-100 animate-fade-in">
                ✓ Evaluation logs committed successfully to the local cache!
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Metric Score:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    id={`review-score-star-${stars}`}
                    key={stars}
                    type="button"
                    onClick={() => setReviewRating(stars)}
                    className={`text-lg transition-colors ${stars <= reviewRating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Headline</label>
              <input
                id="review-title-input"
                type="text"
                required
                placeholder="e.g. Exceptional response, solid craftsmanship"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Evaluation Body</label>
              <textarea
                id="review-text-input"
                required
                rows={3}
                placeholder="Share your detailed assessment of product ergonomics, latency, design, etc..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
              ></textarea>
              
              {/* Dynamic Sentiment AI Tagger */}
              {computedSentiment && (
                <div 
                  id="evaluation-sentiment-ticker" 
                  className={`mt-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 animate-fade-in flex items-center justify-between ${computedSentiment.color}`}
                >
                  <span>{computedSentiment.label}</span>
                  <span className="opacity-60 text-[8px] font-mono">LIVE AI FEED</span>
                </div>
              )}
            </div>

            <button
              id="submit-review-btn"
              type="submit"
              className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
            >
              Commit Evaluation
            </button>
          </form>
        </section>

        {/* Q&A SEGMENT (right 5 cols) */}
        <section id="details-qna-panel" className="lg:col-span-5 space-y-6">
          <div className="border-b border-slate-50 pb-3 flex flex-col gap-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Q&A Forum</h3>
            <p className="text-xs text-slate-400">Peer-to-peer specification clarifications</p>
          </div>

          {/* Q&A Real-time Search input */}
          <div className="space-y-1.5 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Filter Thread</span>
            <input
              id="qa-search-input"
              type="text"
              placeholder="Type keywords (e.g. cable, warranty, setup)..."
              value={qaSearchQuery}
              onChange={(e) => setQaSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
            />
            {qaSearchQuery.trim() && (
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>Found {productQas.length} relevant questions</span>
                <button
                  id="qa-clear-search-btn"
                  onClick={() => setQaSearchQuery('')}
                  className="font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* List of Questions */}
          <div className="space-y-4">
            {productQas.length > 0 ? (
              productQas.map((qa) => (
                <div id={`qa-item-${qa.id}`} key={qa.id} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-teal-600">
                      <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">{qa.question}</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-400 pl-4.5">Asked by {qa.askedBy} • {qa.date}</p>
                  </div>

                  {qa.answer ? (
                    <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 ml-4.5 space-y-1.5 relative overflow-hidden">
                      <span className="absolute top-0 right-0 text-[7px] font-bold tracking-widest text-white uppercase bg-teal-600 px-1.5 py-0.5 rounded-bl-lg">
                        Vetted Reply
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800 mr-1">A:</span>{qa.answer}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span>Answered by</span>
                        <span className="font-bold text-teal-600 inline-flex items-center gap-0.5 bg-teal-50 px-1.5 py-0.5 rounded-full">
                          {qa.answeredBy}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="ml-4.5 pl-1">
                      {/* Only Sellers or Admins can Answer */}
                      {(currentUser.role === UserRole.Seller || currentUser.role === UserRole.Admin) ? (
                        <div className="flex gap-2">
                          <input
                            id={`qa-answer-input-${qa.id}`}
                            type="text"
                            placeholder="Write seller/admin answer..."
                            value={answerTexts[qa.id] || ''}
                            onChange={(e) => setAnswerTexts({ ...answerTexts, [qa.id]: e.target.value })}
                            className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-teal-500"
                          />
                          <button
                            id={`qa-submit-answer-${qa.id}`}
                            onClick={() => handleAnswerSubmit(qa.id)}
                            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">Pending vendor response...</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No enquiries registered for this product.</p>
            )}
          </div>

          {/* Ask Question Form */}
          <form id="add-question-form" onSubmit={handleQuestionSubmit} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Register Specification Query</h4>
            
            {questionSuccess && (
              <div id="question-success-banner" className="rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-100 animate-fade-in">
                ✓ Query submitted and awaiting response logs!
              </div>
            )}

            <div className="space-y-1.5">
              <input
                id="question-text-input"
                type="text"
                required
                placeholder="e.g. Does this package contain a spare cable?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-teal-500"
              />
            </div>

            <button
              id="submit-question-btn"
              type="submit"
              className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
            >
              Enquire Spec
            </button>
          </form>
        </section>

      </div>

    </div>
  );
}
