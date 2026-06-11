import React from 'react';

const OrderTimeline = ({ currentStatus }) => {
  const steps = [
    { label: 'Order Placed', status: 'Order Placed' },
    { label: 'Packed', status: 'Packed' },
    { label: 'Shipped', status: 'Shipped' },
    { label: 'Out For Delivery', status: 'Out For Delivery' },
    { label: 'Delivered', status: 'Delivered' },
  ];

  const getStepClass = (stepStatus, index) => {
    const statusOrder = ['Order Placed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentStatus === 'Cancelled') {
      return 'timeline-step';
    }

    if (stepIndex === currentIndex) {
      return 'timeline-step active';
    } else if (stepIndex < currentIndex) {
      return 'timeline-step completed';
    }
    return 'timeline-step';
  };

  return (
    <div className="timeline">
      {steps.map((step, index) => (
        <div key={step.status} className={getStepClass(step.status, index)}>
          <div className="timeline-dot"></div>
          <span className="timeline-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
