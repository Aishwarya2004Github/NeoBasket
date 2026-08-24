import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const DisplayTable = ({ data = [], column = [] }) => {
  const table = useReactTable({
    data,
    columns: column,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-1 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 rounded-2xl border border-slate-800/60 bg-slate-950/20 backdrop-blur-sm">
      <table className='w-full border-collapse text-left text-xs tracking-wide font-medium text-slate-300'>
        
        {/* Cyberpunk Glowing Header Section */}
        <thead className='bg-slate-950 text-slate-400 font-black uppercase tracking-widest text-[10px] border-b border-slate-800'>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="relative">
              {/* Dynamic Neon Top Light Line Indicator */}
              <th className="px-4 py-3.5 bg-slate-950 text-cyan-400 border-b border-slate-800 font-black text-center w-14">
                SR.NO
              </th>
              {headerGroup.headers.map(header => (
                <th key={header.id} className='px-4 py-3.5 border-b border-slate-800 whitespace-nowrap font-black'>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* Matrix Row Cells */}
        <tbody className="divide-y divide-slate-800/40">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row, index) => (
              <tr 
                key={row.id} 
                className="hover:bg-slate-900/60 transition-colors duration-150 group/row odd:bg-slate-900/20 even:bg-transparent"
              >
                {/* Index Serial Count Cell */}
                <td className='px-4 py-3 text-center border-r border-slate-800/30 text-slate-500 group-hover/row:text-cyan-400 font-bold font-mono transition-colors'>
                  {String(index + 1).padStart(2, '0')}
                </td>
                
                {/* Dynamic Visible Render Cells */}
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='px-4 py-3 whitespace-nowrap text-slate-300 group-hover/row:text-white transition-colors'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            /* Empty Data Fallback HUD */
            <tr>
              <td 
                colSpan={column.length + 1} 
                className="text-center py-12 text-slate-600 font-bold uppercase tracking-widest text-[11px]"
              >
                🛰️ No terminal record entries found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DisplayTable