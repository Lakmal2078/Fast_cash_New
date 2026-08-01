import { TransactionStatus } from '../../types';

const labels: Record<TransactionStatus, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const classes: Record<TransactionStatus, string> = {
  PENDING: 'status-pending',
  UNDER_REVIEW: 'status-under-review',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
  CANCELLED: 'status-cancelled',
};

interface Props {
  status: TransactionStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${classes[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
