"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaChevronRight,
  FaChevronLeft,
  FaShoppingCart,
  FaEye,
} from "react-icons/fa";
import { useCartStore } from "@/store/useCartStore";
import { toast, Toaster } from "react-hot-toast";

// Optimized fetch with no cache for real-time updates
async function fetchAllProducts(limit = 12) {
  try {
    const response = await fetch(`/api/products?limit=${limit}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Helper function to convert string values to numbers
const toNum = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

const normalizePdfUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  if (typeof value === "object" && "url" in value) {
    const candidate = value.url;
    return typeof candidate === "string"
      ? candidate.trim()
      : String(candidate ?? "").trim();
  }
  return String(value ?? "").trim();
};

// Helper function to check if product is available
const isProductAvailable = (product) => {
  if (!product) return false;
  return normalizePdfUrl(product.mainPdfUrl).length > 0;
};

// Memoized Product Card component for better performance
const ProductCard = memo(
  ({ product, onAddToCart, onViewDetails, isProductAvailable }) => {
    const handleViewClick = useCallback(
      (e) => {
        e.stopPropagation();
        onViewDetails(product);
      },
      [product, onViewDetails],
    );

    const handleAddClick = useCallback(
      (e) => {
        e.stopPropagation();
        onAddToCart(product, e);
      },
      [product, onAddToCart],
    );

    const handleCardClick = useCallback(() => {
      onViewDetails(product);
    }, [product, onViewDetails]);

    const isAvailable = useMemo(() => isProductAvailable(product), [product]);

    const discount = useMemo(() => {
      if (product.dumpsMrpInr > product.dumpsPriceInr) {
        return Math.round(
          ((product.dumpsMrpInr - product.dumpsPriceInr) /
            product.dumpsMrpInr) *
            100,
        );
      }
      return 0;
    }, [product.dumpsMrpInr, product.dumpsPriceInr]);

    return (
      <div
        className="flex-shrink-0 w-[92%] sm:w-[320px] md:w-[340px] lg:w-[360px] bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 overflow-hidden cursor-pointer snap-center ml-[4%] first:ml-[4%] sm:ml-0"
        onClick={handleCardClick}
      >
        <div className="p-5 h-full flex flex-col">
          {/* Product Image */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden min-h-[200px] sm:min-h-[220px]">
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.title}
              width={320}
              height={220}
              className="object-contain p-4"
              loading="lazy"
              quality={75}
            />
            {/* Availability Badge */}
            {/* {!isAvailable && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500 text-white">
                  Out of Stock
                </span>
              </div>
            )} */}
          </div>

          {/* Product Title */}
          <h3 className="text-base font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors leading-snug line-clamp-2 min-h-[3rem]">
            {product.title}
          </h3>

          {/* Exam Code */}
          <div className="mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg">
              {product.sapExamCode}
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {product.showWpConnect ? (
              <p className="text-sm font-bold text-blue-600">
                Contact for Best Price
              </p>
            ) : (
              <>
                <p className="text-xl font-bold text-orange-500">
                  ₹{product.dumpsPriceInr}
                </p>
                {product.dumpsMrpInr > product.dumpsPriceInr && (
                  <>
                    <p className="text-sm text-gray-500 line-through">
                      ₹{product.dumpsMrpInr}
                    </p>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-2.5">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              onClick={handleViewClick}
            >
              <FaEye className="text-sm" />
              View Details
            </button>

            {product.showWpConnect ? (
              <a
                href={`https://wa.me/9871952577?text=Hi%2C%20I'm%20interested%20in%20${encodeURIComponent(product.title || product.sapExamCode)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Inquire on WhatsApp
              </a>
            ) : (
              <button
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors shadow-sm ${
                  isAvailable
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={handleAddClick}
                disabled={!isAvailable}
              >
                <FaShoppingCart className="text-sm" />
                {isAvailable ? "Add to Cart" : "Unavailable"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ProductCard.displayName = "ProductCard";

export default function RelatedProducts({ currentSlug, maxProducts = 10 }) {
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Memoized helper functions
  const productAvailabilityCheck = useMemo(() => isProductAvailable, []);

  // Add to cart function with useCallback
  const handleAddToCart = useCallback((product, e) => {
    e?.stopPropagation(); // Prevent card click

    const productAvailable = isProductAvailable(product);

    if (!productAvailable) {
      toast.error("⚠️ This product is currently unavailable (PDF not found)");
      return;
    }

    // Check if item already exists in cart
    const cartStore = useCartStore.getState();
    const existingItem = cartStore.cartItems.find(
      (item) => item._id === product._id && item.type === "regular",
    );

    if (existingItem) {
      toast.info("ℹ️ This item is already in your cart");
      return;
    }

    let item = {
      _id: product._id,
      productId: product._id,
      courseId: product._id,
      type: "regular",
      title: `${product.title} [PDF]`,
      name: `${product.title} [PDF]`,
      mainPdfUrl: normalizePdfUrl(product.mainPdfUrl),
      samplePdfUrl: normalizePdfUrl(product.samplePdfUrl),
      dumpsPriceInr: toNum(product.dumpsPriceInr),
      dumpsPriceUsd: toNum(product.dumpsPriceUsd),
      dumpsMrpInr: toNum(product.dumpsMrpInr),
      dumpsMrpUsd: toNum(product.dumpsMrpUsd),
      comboPriceInr: toNum(product.comboPriceInr),
      comboPriceUsd: toNum(product.comboPriceUsd),
      comboMrpInr: toNum(product.comboMrpInr),
      comboMrpUsd: toNum(product.comboMrpUsd),
      examPriceInr: 0,
      examPriceUsd: 0,
      examMrpInr: 0,
      examMrpUsd: 0,
      imageUrl: product.imageUrl || "",
      slug: product.slug,
      category: product.category,
      sapExamCode: product.sapExamCode,
      code: product.code || product.sapExamCode,
      sku: product.sku,
      duration: product.duration || "",
      numberOfQuestions: product.numberOfQuestions || 0,
      passingScore: product.passingScore || "",
      mainInstructions: product.mainInstructions || "",
      sampleInstructions: product.sampleInstructions || "",
      Description: product.Description || "",
      longDescription: product.longDescription || "",
      status: product.status || "active",
      action: product.action || "",
      metaTitle: product.metaTitle || "",
      metaKeywords: product.metaKeywords || "",
      metaDescription: product.metaDescription || "",
      schema: product.schema || "",
      price: toNum(product.dumpsPriceInr),
      priceINR: toNum(product.dumpsPriceInr),
      priceUSD: toNum(product.dumpsPriceUsd),
    };

    useCartStore.getState().addToCart(item);
    toast.success(`✅ Added ${item.title} to cart!`);
  }, []);

  // View details handler with useCallback
  const handleViewDetails = useCallback(
    (product) => {
      router.push(
        `/itcertifications/${product.category || "sap"}/${product.slug}`,
      );
    },
    [router],
  );

  // Fetch products with memoization
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      const allProducts = await fetchAllProducts(maxProducts + 5);

      if (!isMounted) return;

      const filtered = allProducts
        .filter((p) => p.slug !== currentSlug)
        .slice(0, maxProducts);
      setRelatedProducts(filtered);
      setIsLoading(false);
    }

    if (currentSlug) {
      loadProducts();
    }

    return () => {
      isMounted = false;
    };
  }, [currentSlug, maxProducts]);

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [relatedProducts, checkScrollButtons]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || relatedProducts.length === 0) return;

    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;

        if (isAtEnd) {
          scrollContainerRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          const scrollAmount = clientWidth;
          scrollContainerRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }, 3000);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling, relatedProducts]);

  const scroll = useCallback((direction) => {
    setIsAutoScrolling(false);
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 5000);
    }
  }, []);

  // Memoize displayed products
  const displayedProducts = useMemo(
    () => relatedProducts.slice(0, maxProducts),
    [relatedProducts, maxProducts],
  );

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12 w-full">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="mb-6 px-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Related Products
          </h2>
        </div>

        {/* Carousel Container with Navigation */}
        <div className="relative group px-2 sm:px-0">
          {/* Left Navigation Button */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 ${
              canScrollLeft
                ? "bg-white hover:bg-gray-50 text-gray-800 opacity-0 group-hover:opacity-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-0"
            }`}
            aria-label="Scroll left"
          >
            <FaChevronLeft className="text-base md:text-lg" />
          </button>

          {/* Right Navigation Button */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 ${
              canScrollRight
                ? "bg-white hover:bg-gray-50 text-gray-800 opacity-0 group-hover:opacity-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-0"
            }`}
            aria-label="Scroll right"
          >
            <FaChevronRight className="text-base md:text-lg" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory justify-start"
            onMouseEnter={() => {
              setIsAutoScrolling(false);
              if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
              }
            }}
            onMouseLeave={() => {
              setIsAutoScrolling(true);
            }}
          >
            {displayedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                isProductAvailable={isProductAvailable}
              />
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {Array.from({ length: Math.min(relatedProducts.length, 5) }).map(
            (_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const scrollAmount = scrollContainerRef.current.clientWidth;
                    scrollContainerRef.current.scrollTo({
                      left: scrollAmount * idx,
                      behavior: "smooth",
                    });
                  }
                }}
                className="w-1.5 h-1.5 rounded-full bg-gray-300 hover:bg-blue-500 transition-colors"
                aria-label={`Go to slide ${idx + 1}`}
              />
            ),
          )}
        </div>

        <Toaster position="bottom-center" />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Snap scrolling */
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        .snap-center {
          scroll-snap-align: center;
        }
        .snap-mandatory {
          scroll-snap-stop: always;
        }

        /* Smooth animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
