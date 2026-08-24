import React from 'react'

const Divider = ({ className = "" }) => {
  return (
    /* Cyberpunk Ultra-Thin Matrix Line Strip */
    <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-slate-800/80 to-transparent my-3.5 ${className}`} />
  )
}

export default Divider