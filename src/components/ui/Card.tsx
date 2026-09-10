import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { type LucideIcon, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimatedCounter } from '../AnimatedCounter';

export type CardVariant =
  | 'default'
  | 'primary'
  | 'feature'
  | 'info'
  | 'stat'
  | 'profile'
  | 'action'
  | 'event'
  | 'opportunity'
  | 'announcement'
  | 'list'
  | 'empty';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  clickable?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  staggerIndex?: number;
  className?: string;
  children?: React.ReactNode;
}

// Global Spring / Easing Timing
const defaultEase = [0.22, 1, 0.36, 1] as const;

/**
 * Base Card Component
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      clickable = false,
      elevation = 'md',
      padding = 'md',
      staggerIndex,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    // Variant surface styles matching clay-olive industrial design
    const variantStyles: Record<CardVariant, string> = {
      default:
        'bg-[#171D12] border-white/5 text-[#F1F2E9] shadow-[0_14px_35px_rgba(0,0,0,0.38),inset_0_1px_1px_rgba(255,255,255,0.055)]',
      primary:
        'bg-[#171D12] border-[#71825B]/30 text-[#F1F2E9] shadow-[0_14px_35px_rgba(0,0,0,0.38),inset_0_1px_1px_rgba(255,255,255,0.08)]',
      feature:
        'bg-gradient-to-br from-[#171D12] to-[#1D2517] border-white/10 text-[#F1F2E9] shadow-[0_14px_35px_rgba(0,0,0,0.4)]',
      info: 'bg-[#171D12] border-[#71825B]/25 text-[#F1F2E9]',
      stat: 'bg-[#171D12] border-white/5 text-[#F1F2E9]',
      profile:
        'bg-[#171D12] border-[#252E1D] text-[#F1F2E9] shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
      action:
        'bg-[#171D12] border-[#71825B]/30 hover:border-[#A4B18A]/50 text-[#F1F2E9]',
      event:
        'bg-[#171D12] border-[#252E1D] text-[#F1F2E9] shadow-[0_10px_25px_rgba(0,0,0,0.3)]',
      opportunity:
        'bg-gradient-to-br from-[#171D12] via-[#1D2517] to-[#171D12] border-[#71825B]/40 text-[#F1F2E9]',
      announcement:
        'bg-[#171D12] border-[#71825B]/35 text-[#F1F2E9] shadow-[0_14px_35px_rgba(0,0,0,0.4)]',
      list: 'bg-[#0B0E09] border-[#252E1D] text-[#F1F2E9] shadow-inner',
      empty:
        'bg-[#0B0E09] border-dashed border-[#252E1D] text-[#71825B] text-center'
    };

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8'
    };

    const isInteractive = clickable || !!onClick;

    const baseClasses = `
      relative rounded-2xl border transition-colors duration-200 overflow-hidden
      ${variantStyles[variant]}
      ${paddingStyles[padding]}
      ${isInteractive ? 'cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#A4B18A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10140D]' : ''}
      ${className}
    `;

    // Framer Motion Animation Settings
    const initialAnimation = { opacity: 0, y: shouldReduceMotion ? 0 : 12 };
    const animateAnimation = { opacity: 1, y: 0 };
    const transitionAnimation = {
      duration: 0.35,
      delay: typeof staggerIndex === 'number' ? Math.min(staggerIndex * 0.04, 0.4) : 0,
      ease: defaultEase
    };

    const hoverProps = isInteractive
      ? {
          whileHover: shouldReduceMotion
            ? {}
            : {
                y: -3,
                scale: 1.008,
                boxShadow:
                  '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(164, 177, 138, 0.4)'
              },
          whileTap: shouldReduceMotion ? {} : { y: 1, scale: 0.995 }
        }
      : {};

    return (
      <motion.div
        ref={ref}
        initial={initialAnimation}
        animate={animateAnimation}
        transition={transitionAnimation}
        {...hoverProps}
        className={baseClasses.trim()}
        onClick={onClick}
        tabIndex={isInteractive ? 0 : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Sub-components
 */
export const CardHeader: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => (
  <div className={`flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => (
  <h3
    className={`text-base font-extrabold text-[#F1F2E9] tracking-tight ${className}`}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => (
  <p className={`text-xs text-[#71825B] leading-relaxed mt-1 font-sans ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => (
  <div className={`mt-4 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => (
  <div
    className={`mt-4 pt-3.5 border-t border-[#252E1D] flex items-center justify-between text-xs font-mono ${className}`}
  >
    {children}
  </div>
);

export const CardBadge: React.FC<{
  variant?: 'sage' | 'olive' | 'ivory' | 'dark' | 'critical';
  className?: string;
  children: React.ReactNode;
}> = ({ variant = 'sage', className = '', children }) => {
  const styles = {
    sage: 'bg-[#0B0E09] border-[#252E1D] text-[#A4B18A]',
    olive: 'bg-[#1D2517] border-[#71825B]/40 text-[#A4B18A]',
    ivory: 'bg-[#0B0E09] border-[#71825B]/40 text-[#E4E7D8]',
    dark: 'bg-[#0B0E09] border-white/5 text-[#71825B]',
    critical: 'bg-[#1D2517] border-[#71825B] text-[#F1F2E9]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border shadow-inner tracking-wider uppercase ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const CardIconBadge: React.FC<{
  icon: LucideIcon;
  variant?: 'sage' | 'olive' | 'ivory' | 'dark';
  size?: number;
  className?: string;
}> = ({ icon: Icon, variant = 'sage', size = 18, className = '' }) => {
  const styles = {
    sage: 'bg-[#1D2517] text-[#A4B18A] border-[#71825B]/30',
    olive: 'bg-[#171D12] text-[#71825B] border-[#252E1D]',
    ivory: 'bg-[#1D2517] text-[#E4E7D8] border-[#71825B]/40',
    dark: 'bg-[#0B0E09] text-[#71825B] border-[#252E1D]'
  };

  return (
    <div
      className={`p-2.5 rounded-xl border shadow-inner shrink-0 flex items-center justify-center ${styles[variant]} ${className}`}
    >
      <Icon size={size} />
    </div>
  );
};

/**
 * Responsive Animated Card Grid Wrapper
 */
export const CardGrid: React.FC<{
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  children: React.ReactNode;
}> = ({ columns = 3, className = '', children }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-5 ${className}`}>
      {React.Children.map(children, (child, idx) => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child as React.ReactElement<any>, {
            staggerIndex: idx
          });
        }
        return child;
      })}
    </div>
  );
};

/**
 * Card Loading Skeleton
 */
export const CardSkeleton: React.FC<{
  height?: string;
  className?: string;
}> = ({ height = 'h-48', className = '' }) => (
  <div
    className={`bg-[#171D12] border border-white/5 rounded-2xl p-6 relative overflow-hidden animate-pulse ${height} ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-[#252E1D]" />
      <div className="w-20 h-5 rounded-lg bg-[#252E1D]" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="w-3/4 h-5 rounded-md bg-[#252E1D]" />
      <div className="w-1/2 h-4 rounded-md bg-[#252E1D]" />
    </div>
    <div className="mt-6 w-full h-12 rounded-xl bg-[#0B0E09]" />
  </div>
);

// ==========================================
// 12 SEMANTIC CARD VARIANTS
// ==========================================

/** 1. Primary Card */
export const PrimaryCard: React.FC<
  CardProps & {
    title: string;
    subtitle?: string;
    badge?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
  }
> = ({ title, subtitle, badge, icon: Icon, action, children, ...props }) => (
  <Card variant="primary" {...props}>
    <CardHeader>
      <div className="flex items-center gap-3">
        {Icon && <CardIconBadge icon={Icon} variant="sage" />}
        <div>
          {subtitle && (
            <span className="text-[10px] font-mono uppercase font-bold text-[#71825B] tracking-wider block">
              {subtitle}
            </span>
          )}
          <CardTitle>{title}</CardTitle>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && <CardBadge variant="sage">{badge}</CardBadge>}
        {action}
      </div>
    </CardHeader>
    {children && <CardContent>{children}</CardContent>}
  </Card>
);

/** 2. Feature Card */
export const FeatureCard: React.FC<
  CardProps & {
    title: string;
    description: string;
    icon: LucideIcon;
    badge?: string;
    actionText?: string;
  }
> = ({ title, description, icon: Icon, badge, actionText = 'EXPLORE MODULE', ...props }) => (
  <Card variant="feature" clickable {...props}>
    <div className="flex items-center justify-between">
      <CardIconBadge icon={Icon} variant="sage" />
      {badge && <CardBadge variant="sage">{badge}</CardBadge>}
    </div>
    <div className="mt-4">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </div>
    <div className="mt-5 pt-3 border-t border-[#252E1D] flex items-center gap-1 text-xs font-mono font-bold text-[#A4B18A] uppercase tracking-wider group-hover:translate-x-1 transition duration-200">
      <span>{actionText}</span>
      <ArrowRight size={14} />
    </div>
  </Card>
);

/** 3. Info Card */
export const InfoCard: React.FC<
  CardProps & {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
  }
> = ({ title, description, icon: Icon, action, children, ...props }) => (
  <Card variant="info" {...props}>
    <div className="flex items-start gap-3.5">
      {Icon && <CardIconBadge icon={Icon} variant="olive" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          {action}
        </div>
        <CardDescription>{description}</CardDescription>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  </Card>
);

/** 4. Stat Card */
export const StatCard: React.FC<
  CardProps & {
    title: string;
    value: number | string;
    unit?: string;
    subtext?: string;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    badge?: string;
  }
> = ({ title, value, unit, subtext, icon: Icon, trend, trendValue, badge, ...props }) => (
  <Card variant="stat" {...props}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#71825B]">
        {title}
      </span>
      <div className="flex items-center gap-2">
        {badge && <CardBadge variant="sage">{badge}</CardBadge>}
        {Icon && <Icon size={16} className="text-[#A4B18A]" />}
      </div>
    </div>

    <div className="text-2xl font-black text-[#F1F2E9] font-mono mt-2 flex items-baseline gap-1.5">
      {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
      {unit && <span className="text-xs font-sans text-[#71825B] font-normal">{unit}</span>}
    </div>

    {(subtext || trendValue) && (
      <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono">
        {subtext && <span className="text-[#71825B]">{subtext}</span>}
        {trendValue && (
          <span
            className={`flex items-center gap-1 font-bold ${
              trend === 'up'
                ? 'text-[#A4B18A]'
                : trend === 'down'
                ? 'text-[#F1F2E9]'
                : 'text-[#71825B]'
            }`}
          >
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            {trendValue}
          </span>
        )}
      </div>
    )}
  </Card>
);

/** 5. Profile Card */
export const ProfileCard: React.FC<
  CardProps & {
    name: string;
    subtitle: string;
    status?: 'ACTIVE' | 'MAINTENANCE' | 'CRITICAL' | string;
    metrics?: Array<{ label: string; value: string | number }>;
    actions?: React.ReactNode;
  }
> = ({ name, subtitle, status, metrics, actions, children, ...props }) => {
  const getStatusBadge = (st?: string) => {
    if (!st) return null;
    switch (st) {
      case 'ACTIVE':
        return <CardBadge variant="olive">ACTIVE</CardBadge>;
      case 'MAINTENANCE':
        return <CardBadge variant="dark">MAINT</CardBadge>;
      case 'CRITICAL':
        return <CardBadge variant="critical">CRITICAL</CardBadge>;
      default:
        return <CardBadge variant="sage">{st}</CardBadge>;
    }
  };

  return (
    <Card variant="profile" {...props}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono text-[#71825B] uppercase font-bold">
            {subtitle}
          </span>
          <h3 className="font-extrabold text-[#F1F2E9] text-base mt-0.5">{name}</h3>
        </div>
        {getStatusBadge(status)}
      </div>

      {metrics && metrics.length > 0 && (
        <div className="mt-3 text-xs font-mono text-[#71825B] space-y-1.5 bg-[#0B0E09] p-3 rounded-xl border border-[#252E1D]">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{m.label}:</span>
              <span className="text-[#F1F2E9] font-semibold">{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}
      {actions && <div className="mt-4 pt-3 border-t border-[#1D2517]">{actions}</div>}
    </Card>
  );
};

/** 6. Action Card */
export const ActionCard: React.FC<
  CardProps & {
    title: string;
    description: string;
    icon: LucideIcon;
    actionText?: string;
  }
> = ({ title, description, icon: Icon, actionText = 'EXECUTE ACTION', ...props }) => (
  <Card variant="action" clickable {...props}>
    <div className="flex items-center gap-3">
      <CardIconBadge icon={Icon} variant="ivory" />
      <div className="flex-1 min-w-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <div className="p-2 rounded-xl bg-[#1D2517] text-[#A4B18A] border border-[#252E1D] group-hover:translate-x-1 transition">
        <ArrowRight size={16} />
      </div>
    </div>
  </Card>
);

/** 7. Event Card */
export const EventCard: React.FC<
  CardProps & {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    metrics?: Array<{ label: string; value: string | number }>;
    actions?: React.ReactNode;
  }
> = ({ title, subtitle, icon: Icon, metrics, actions, children, ...props }) => (
  <Card variant="event" {...props}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono uppercase font-bold text-[#71825B]">
        {subtitle}
      </span>
      <Icon size={20} className="text-[#A4B18A]" />
    </div>

    <CardTitle className="mt-1.5">{title}</CardTitle>

    {metrics && metrics.length > 0 && (
      <div className="w-full text-xs font-mono space-y-1.5 bg-[#0B0E09] p-2.5 rounded-xl border border-[#252E1D] mt-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="text-[#71825B]">{m.label}:</span>
            <span className="text-[#F1F2E9] font-bold">{m.value}</span>
          </div>
        ))}
      </div>
    )}

    {children && <div className="mt-3">{children}</div>}
    {actions && <div className="mt-3 pt-2">{actions}</div>}
  </Card>
);

/** 8. Opportunity Card */
export const OpportunityCard: React.FC<
  CardProps & {
    title: string;
    impact: string;
    category: string;
    tag?: string;
  }
> = ({ title, impact, category, tag, children, ...props }) => (
  <Card variant="opportunity" clickable {...props}>
    <div className="flex items-center justify-between">
      <CardBadge variant="olive">{category}</CardBadge>
      {tag && <CardBadge variant="ivory">{tag}</CardBadge>}
    </div>

    <CardTitle className="mt-3">{title}</CardTitle>

    <div className="mt-2 text-xs font-mono text-[#A4B18A] font-bold">
      Target Impact: {impact}
    </div>

    {children && <div className="mt-3">{children}</div>}
  </Card>
);

/** 9. Announcement Card */
export const AnnouncementCard: React.FC<
  CardProps & {
    title: string;
    message: string;
    icon?: LucideIcon;
    badge?: string;
  }
> = ({ title, message, icon: Icon, badge, children, ...props }) => (
  <Card variant="announcement" {...props}>
    <div className="flex items-start gap-3.5">
      {Icon && <CardIconBadge icon={Icon} variant="sage" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs sm:text-sm">{title}</CardTitle>
          {badge && <CardBadge variant="sage">{badge}</CardBadge>}
        </div>
        <p className="text-xs text-[#C0C6B2] mt-1.5 leading-relaxed font-sans font-medium">
          {message}
        </p>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  </Card>
);

/** 10. List Card */
export const ListCard: React.FC<
  CardProps & {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    icon?: LucideIcon;
  }
> = ({ title, subtitle, badge, actions, icon: Icon, children, ...props }) => (
  <Card variant="list" padding="sm" clickable {...props}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start sm:items-center gap-3">
        {Icon && <CardIconBadge icon={Icon} variant="dark" size={15} />}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {badge}
            {subtitle && (
              <span className="text-[9px] font-mono text-[#71825B] uppercase font-semibold">
                {subtitle}
              </span>
            )}
          </div>
          <h4 className="font-bold text-[#F1F2E9] text-xs sm:text-sm">{title}</h4>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
    {children && <div className="mt-2 pt-2 border-t border-[#252E1D]">{children}</div>}
  </Card>
);

/** 11. Empty-State Card */
export const EmptyStateCard: React.FC<
  CardProps & {
    title: string;
    description: string;
    icon: LucideIcon;
    actionText?: string;
    onAction?: () => void;
  }
> = ({ title, description, icon: Icon, actionText, onAction, ...props }) => (
  <Card variant="empty" padding="lg" {...props}>
    <div className="flex flex-col items-center justify-center space-y-3 py-6">
      <div className="p-3 rounded-2xl bg-[#171D12] border border-[#252E1D] text-[#71825B]">
        <Icon size={24} />
      </div>
      <div>
        <h4 className="font-bold text-[#F1F2E9] text-sm">{title}</h4>
        <p className="text-xs text-[#71825B] max-w-sm mt-1 leading-relaxed font-sans">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 btn-clay-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0B0E09] cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  </Card>
);
