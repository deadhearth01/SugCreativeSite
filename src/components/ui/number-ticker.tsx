'use client'

import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

interface NumberTickerProps {
  value: number
  className?: string
  suffix?: string
  prefix?: string
  decimals?: number
}

export function NumberTicker({ value, className, suffix = '', prefix = '', decimals = 0 }: NumberTickerProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <span ref={ref} className={className}>
      {inView ? (
        <CountUp
          end={value}
          duration={2.5}
          separator=","
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
        />
      ) : (
        '0' + suffix
      )}
    </span>
  )
}
