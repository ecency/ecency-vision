import React from 'react';

interface Props {
    className?: string;
}

export const Skeleton = ({className}:Props) => {
    return <div className={`skeleton ${className}`} />
}