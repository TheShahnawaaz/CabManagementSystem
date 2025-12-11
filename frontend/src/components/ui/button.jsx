import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-slate-800',
        outline: 'border border-slate-200 bg-white text-primary hover:bg-slate-50',
      },
      size: {
        sm: 'px-3 py-2',
        md: 'px-4 py-2.5',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

const Button = ({ className, variant, size, ...props }) => (
  <button className={twMerge(buttonStyles({ variant, size }), className)} {...props} />
);

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

Button.defaultProps = {
  className: '',
  variant: 'default',
  size: 'md',
};

export default Button;
