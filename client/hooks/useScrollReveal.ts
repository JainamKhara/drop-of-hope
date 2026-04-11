'use client';

import { useEffect, useRef } from 'react';

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  animationClass?: string;
}

/**
 * Hook for scroll-triggered animations using Intersection Observer
 * Usage:
 *   const ref = useScrollReveal({ threshold: 0.1, delay: 60 });
 *   return <div ref={ref} className="animate-slide-left">Content</div>
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    delay = 0,
    animationClass = 'animate-slide-left',
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial state (hidden before animation)
    element.style.opacity = '0';

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Trigger animation with optional delay
        setTimeout(() => {
          element.classList.add(animationClass);
          element.style.opacity = '1';
        }, delay);

        // Stop observing once animated
        observer.unobserve(element);
      }
    }, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay, animationClass]);

  return elementRef;
}

/**
 * Hook for counting up numbers with animation
 * Usage:
 *   const countRef = useCountUp({ end: 10000, duration: 2000 });
 *   return <span ref={countRef}>0</span>
 */
export interface CountUpOptions {
  end: number;
  duration?: number;
  delay?: number;
  triggerOnScroll?: boolean;
}

export function useCountUp(options: CountUpOptions) {
  const { end, duration = 2000, delay = 0, triggerOnScroll = true } = options;
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const startAnimation = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      let started = false;
      let startTimestamp: number | null = null;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * end);

        element.textContent = value.toLocaleString();

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
        }
      };

      // Apply delay before starting animation
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(step);
      }, delay);
    };

    if (triggerOnScroll) {
      // Wait for scroll into view
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !started) {
          startAnimation();
          started = true;
          observer.unobserve(element);
        }
      }, { threshold: 0.1 });

      observer.observe(element);
      return () => observer.disconnect();
    } else {
      // Start immediately
      startAnimation();
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [end, duration, delay, triggerOnScroll]);

  return elementRef;
}

/**
 * Hook for staggered animations on multiple child elements
 * Usage:
 *   const containerRef = useStaggeredReveal({ itemSelector: '.revelation', delayBetween: 60 });
 *   return (
 *     <div ref={containerRef}>
 *       <div className="revelation">Item 1</div>
 *       <div className="revelation">Item 2</div>
 *     </div>
 *   )
 */
export interface StaggeredRevealOptions {
  itemSelector: string;
  delayBetween?: number;
  animationClass?: string;
  threshold?: number;
}

export function useStaggeredReveal(options: StaggeredRevealOptions) {
  const {
    itemSelector,
    delayBetween = 60,
    animationClass = 'animate-slide-left',
    threshold = 0.1,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    items.forEach((item) => {
      (item as HTMLElement).style.opacity = '0';
    });

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        items.forEach((item, index) => {
          setTimeout(() => {
            (item as HTMLElement).classList.add(animationClass);
            (item as HTMLElement).style.opacity = '1';
          }, index * delayBetween);
        });

        observer.unobserve(container);
      }
    }, { threshold });

    observer.observe(container);

    return () => observer.disconnect();
  }, [itemSelector, delayBetween, animationClass, threshold]);

  return containerRef;
}
