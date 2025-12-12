import PropTypes from 'prop-types';
import clsx from 'clsx';

const Card = ({ title, description, children, className }) => (
  <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
    {title && <h3 className="text-lg font-semibold text-primary">{title}</h3>}
    {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
    {children && <div className="mt-4 space-y-3 text-sm text-slate-700">{children}</div>}
  </div>
);

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

Card.defaultProps = {
  title: '',
  description: '',
  children: null,
  className: '',
};

export default Card;
